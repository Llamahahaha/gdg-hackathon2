"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if truly unauthenticated (not just initializing)
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  // Never block rendering — loading is always false with the mock auth.
  // Blocking here caused the "flash then disappear" bug on protected routes.
  return <>{children}</>;
}
