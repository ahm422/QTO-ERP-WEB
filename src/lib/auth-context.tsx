"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { roles, type Role } from "@/db/enums";
import {
  bootstrapSessionFromCookie,
  getAccessToken,
  resetAuthClientState,
  setAccessToken,
  type RefreshSessionResult,
} from "@/lib/auth-refresh-client";
import { hasCapability, type Capability } from "@/lib/permission-matrix";

type AuthUser = {
  email: string;
  role: Role;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  can: (capability: Capability) => boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LOGIN_PATH = "/admin/login";

function parseRole(role: string): Role | null {
  return roles.includes(role as Role) ? (role as Role) : null;
}

function toAuthUser(data: RefreshSessionResult): AuthUser | null {
  const role = parseRole(data.role);
  if (!role) return null;
  return { email: data.email, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(
    (data: RefreshSessionResult | null) => {
      if (!data) {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        return;
      }
      const nextUser = toAuthUser(data);
      if (!nextUser) {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        return;
      }
      setAccessToken(data.accessToken);
      setAccessTokenState(data.accessToken);
      setUser(nextUser);
    },
    [],
  );

  const refetch = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      applySession(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        applySession(null);
        return;
      }
      const data = (await response.json()) as { email: string; role: string };
      const role = parseRole(data.role);
      if (!role) {
        applySession(null);
        return;
      }
      setUser({ email: data.email, role });
      setAccessTokenState(token);
    } catch {
      applySession(null);
    }
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return { ok: false as const, error: "Invalid email or password." };
      }

      const data = (await response.json()) as RefreshSessionResult;
      applySession(data);
      return { ok: true as const };
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const token = getAccessToken();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } finally {
      resetAuthClientState();
      setAccessTokenState(null);
      setUser(null);
      window.location.href = LOGIN_PATH;
    }
  }, []);

  const can = useCallback(
    (capability: Capability) => {
      if (!user) return false;
      return hasCapability(user.role, capability);
    },
    [user],
  );

  useEffect(() => {
    if (pathname === LOGIN_PATH) {
      setLoading(false);
      return;
    }

    const existing = getAccessToken();
    if (existing) {
      void refetch().finally(() => setLoading(false));
      return;
    }

    let cancelled = false;

    void bootstrapSessionFromCookie()
      .then((data) => {
        if (!cancelled) {
          applySession(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          applySession(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, applySession, refetch]);

  const value = useMemo(
    () => ({ user, accessToken, loading, can, login, logout, refetch }),
    [user, accessToken, loading, can, login, logout, refetch],
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
