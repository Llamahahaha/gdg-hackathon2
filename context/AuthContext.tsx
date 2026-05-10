"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hackathon Bypass: Firebase API key was suspended by Google Cloud.
    // We mock the user session so the demo works flawlessly.
    const mockUser = {
      uid: "demo-coach-001",
      email: "analyst@fieldtheory.ai",
      displayName: "Head Analyst",
      photoURL: "https://ui-avatars.com/api/?name=Head+Analyst&background=00f3ff&color=000"
    } as User;
    
    // Auto-login for the demo
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    const mockUser = {
      uid: "demo-coach-001",
      email: "analyst@fieldtheory.ai",
      displayName: "Head Analyst",
      photoURL: "https://ui-avatars.com/api/?name=Head+Analyst&background=00f3ff&color=000"
    } as User;
    setUser(mockUser);
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
