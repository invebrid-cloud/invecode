"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";
import { useUser } from "./use-user";

export type UserNotification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: UserNotification[];
  setNotifications: (
    updater: UserNotification[] | ((prev: UserNotification[]) => UserNotification[])
  ) => void;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

const QUERY_KEY = ["userNotifications"];

async function fetchNotificationsFromApi(): Promise<UserNotification[]> {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notify/me`);
    if (!res || !res.ok) return [];

    const data = await res.json();

    const rawList: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.rows)
            ? data.rows
            : [];

    return rawList.map((n: any, idx: number) => {
      // Handle MongoDB _id, undefined id, or non-numeric string IDs safely
      const rawId = n.id ?? n._id ?? n.notification_id ?? idx;
      const parsedId = typeof rawId === "number" ? rawId : Number(rawId);

      return {
        // Fallback to index or string representation if Number() yields NaN
        id: Number.isNaN(parsedId) ? rawId : parsedId,
        title: String(n.title || "Notification"),
        message: String(n.message || ""),
        read: Boolean(n.read ?? n.is_read ?? false),
        createdAt: n.createdAt || n.created_at || n.date || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    return [];
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useUser();
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);

  // React Query handles fetching and caching automatically
  const { data: notifications = [], isLoading } = useQuery<UserNotification[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchNotificationsFromApi,
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 5, // Keep cached data fresh for 5 minutes
    gcTime: 1000 * 60 * 30,    // Retain cache in memory for 30 minutes
  });

  // Safe setter helper that modifies the TanStack Query Cache directly
  const setNotifications = (
    updater: UserNotification[] | ((prev: UserNotification[]) => UserNotification[])
  ) => {
    queryClient.setQueryData<UserNotification[]>(QUERY_KEY, (old = []) => {
      return typeof updater === "function" ? updater(old) : updater;
    });
  };

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  // Real-time WebSocket connection handling with direct Query Cache updates
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WSS_URL}?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_NOTIFICATION" && data.notification) {
          const raw = data.notification;
          const rawId = raw.id ?? raw._id ?? Date.now();
          const parsedId = typeof rawId === "number" ? rawId : Number(rawId);

          const normalizedNotification: UserNotification = {
            id: Number.isNaN(parsedId) ? rawId : parsedId,
            title: String(raw.title || "Notification"),
            message: String(raw.message || ""),
            read: Boolean(raw.read ?? raw.is_read ?? false),
            createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
          };

          queryClient.setQueryData<UserNotification[]>(QUERY_KEY, (prev = []) => {
            const exists = prev.some((n) => n.id === normalizedNotification.id);
            if (exists) return prev;
            return [normalizedNotification, ...prev].slice(0, 10);
          });
        }

        if (data.type === "NOTIFICATION_READ") {
          queryClient.setQueryData<UserNotification[]>(QUERY_KEY, (prev = []) =>
            prev.map((n) => (n.id === data.notificationId ? { ...n, read: true } : n))
          );
        }

        if (data.type === "ALL_NOTIFICATIONS_READ") {
          queryClient.setQueryData<UserNotification[]>(QUERY_KEY, (prev = []) =>
            prev.map((n) => ({ ...n, read: true }))
          );
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };
    
    socket.onclose = () => {
      setTimeout(() => {
        if (user) {
          socketRef.current = new WebSocket(wsUrl);
        }
      }, 3000);
    };

    return () => {
      socket.close();
    };
  }, [user, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        loading: isLoading || authLoading,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return context;
}