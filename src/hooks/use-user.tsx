'use client';

import { createContext, useContext, useEffect, useState } from "react";

type UserType = {
  id: number;
  email: string;
  role: string;
};

type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  authLoading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On first app load, restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }

    setAuthLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, authLoading }}>
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