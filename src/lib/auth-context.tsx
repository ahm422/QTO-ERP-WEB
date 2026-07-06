"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAccessToken, setAccessToken } from "@/lib/access-token";

type AuthUser = {
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = (await response.json()) as AuthUser;
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          const data = (await response.json()) as AuthUser & {
            accessToken: string;
          };
          setAccessToken(data.accessToken);
          setUser({ email: data.email, role: data.role });
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({ user, loading, refetch }),
    [user, loading, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
