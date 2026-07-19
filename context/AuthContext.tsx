"use client";

import React, { createContext, useContext, useState } from "react";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Hackathon Bypass: Firebase API key was suspended by Google Cloud.
// Defined first so it can be used in createContext default AND useState.
export const MOCK_USER = {
  uid: "demo-coach-001",
  email: "analyst@fieldtheory.ai",
  displayName: "Head Analyst",
  photoURL: "https://ui-avatars.com/api/?name=Head+Analyst&background=00f3ff&color=000"
} as User;

// Default value matches mock so any consumer before Provider mounts
// never sees an unauthenticated state (prevents flash redirects).
const AuthContext = createContext<AuthContextType>({
  user: MOCK_USER,
  loading: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [loading] = useState(false);

  const signInWithGoogle = async () => {
    setUser(MOCK_USER);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
