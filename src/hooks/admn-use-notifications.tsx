"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "./api";
import { useUser } from "./use-user";

type UserNotification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: UserNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<UserNotification[]>>;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useUser();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      // setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/notify/me`);
      if (!res) return;

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    //   console.log(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
    }

    if (!authLoading && !user) {
      setNotifications([]);
      setLoading(false);
    }
  }, [authLoading, user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

   const wsUrl = `${process.env.NEXT_PUBLIC_WSS_URL}?token=${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
    //   console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_NOTIFICATION") {
          setNotifications((prev) => {
            const exists = prev.some(n => n.id === data.notification.id);
            if (exists) return prev;
            return [data.notification, ...prev];
          });
        }

        if (data.type === "NOTIFICATION_READ") {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === data.notificationId
                ? { ...n, read: true }
                : n
            )
          );
        }

        if (data.type === "ALL_NOTIFICATIONS_READ") {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
          );
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    socket.onclose = () => {
    //   console.log("WebSocket disconnected");

      // 🔄 Optional: Auto reconnect after 3 seconds
      setTimeout(() => {
        if (user) {
          console.log("Reconnecting WebSocket...");
          socketRef.current = new WebSocket(wsUrl);
        }
      }, 3000);
    };

    return () => {
      socket.close();
    };

  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        loading,
        refreshNotifications: fetchNotifications, 
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