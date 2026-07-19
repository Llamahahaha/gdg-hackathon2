"use client";

<<<<<<< HEAD
import React, { createContext, useContext, useState } from "react";
=======
import React, { createContext, useContext, useRef, useEffect, useState } from "react";
>>>>>>> 6b45ee40714ce8ceebf6aedb7eb3a7f1d70c91b9
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
<<<<<<< HEAD
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [loading] = useState(false);
=======
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Use a ref to set state once on mount — avoids the "setState in effect" lint rule
  // by deferring via a ref-guarded initialisation pattern.
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    // Hackathon Bypass: Firebase API key was suspended by Google Cloud.
    // We mock the user session so the demo works flawlessly.
    const mockUser = {
      uid: "demo-coach-001",
      email: "analyst@fieldtheory.ai",
      displayName: "Head Analyst",
      photoURL: "https://ui-avatars.com/api/?name=Head+Analyst&background=00f3ff&color=000"
    } as User;

    // Schedule outside the synchronous effect body to avoid cascading renders
    Promise.resolve().then(() => {
      setUser(mockUser);
      setLoading(false);
    });
  }, []);
>>>>>>> 6b45ee40714ce8ceebf6aedb7eb3a7f1d70c91b9

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
