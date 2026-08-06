'use client';

import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type UserType = {
  id: number;
  email: string;
  role: string;
};

type UserContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  authLoading: boolean;
  refetchUser: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

// Fetcher function that pulls user data from localStorage or your backend API
async function fetchUserSession(): Promise<UserType | null> {
  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to parse user session", err);
    return null;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: user = null,
    isLoading: authLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["userSession"],
    queryFn: fetchUserSession,
    staleTime: Infinity, // User session stays fresh until manually updated/logged out
    gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
  });

  // Helper to update both React Query cache and localStorage
  const setUser = (newUser: UserType | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    // Update the cache instantly without causing loading spinners
    queryClient.setQueryData(["userSession"], newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser, authLoading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}