"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";

const MIN_PASSWORD_LENGTH = 12;

type ProfileMe = {
  email: string;
  role: string;
  name: string | null;
  createdAt: string;
};

type SessionItem = {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  isCurrent: boolean;
};

function getAvatarInitial(name: string | null, email: string): string {
  const fromName = name?.trim().charAt(0);
  if (fromName) return fromName.toUpperCase();
  const local = email.split("@")[0] ?? "";
  return (local.charAt(0) || "?").toUpperCase();
}

/** Lightweight user-agent summary — no dependency. */
function summarizeUserAgent(ua: string | null): string {
  if (!ua?.trim()) return "Unknown device";

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

export default function ProfilePage() {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileMe | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [me, sessionData] = await Promise.all([
        adminFetch<ProfileMe>("/api/auth/me"),
        adminFetch<{ ok: true; sessions: SessionItem[] }>("/api/auth/sessions"),
      ]);
      setProfile(me);
      setSessions(sessionData.sessions);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from the current password.");
      return;
    }

    setSavingPassword(true);
    try {
      await adminFetch<{ ok: true }>("/api/auth/me/password", {
        method: "PATCH",
        json: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
      const sessionData = await adminFetch<{
        ok: true;
        sessions: SessionItem[];
      }>("/api/auth/sessions");
      setSessions(sessionData.sessions);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to change password",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const revokeSession = async (id: string) => {
    setRevokingId(id);
    try {
      await adminFetch<{ ok: true }>("/api/auth/sessions", {
        method: "DELETE",
        json: { id },
      });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session signed out");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to revoke session",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      await adminFetch<{ ok: true }>("/api/auth/sessions", {
        method: "DELETE",
        json: { all: true },
      });
      toast.success("Signed out everywhere");
      await logout();
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to sign out everywhere",
      );
      setRevokingAll(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load profile. Refresh and try again.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details, password, and active sessions.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Account</h2>
        <div className="flex items-start gap-4">
          <Avatar size="lg">
            <AvatarFallback>
              {getAvatarInitial(profile.name, profile.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-medium">
              {profile.name?.trim() || "—"}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {profile.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">{profile.role}</Badge>
              <span className="text-xs text-muted-foreground">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Change password</h2>
          <p className="text-sm text-muted-foreground">
            Other devices will be signed out. This device stays signed in.
          </p>
        </div>
        <form className="space-y-4" onSubmit={(e) => void changePassword(e)}>
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              className="mt-1"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="mt-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </div>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Active sessions</h2>
            <p className="text-sm text-muted-foreground">
              Devices where you are currently signed in.
            </p>
          </div>
          {sessions.length > 0 ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={revokingAll}
              onClick={() => void revokeAllSessions()}
            >
              {revokingAll ? "Signing out…" : "Sign out everywhere"}
            </Button>
          ) : null}
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active sessions found.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {summarizeUserAgent(session.userAgent)}
                    </p>
                    {session.isCurrent ? (
                      <Badge variant="success">Current</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.ip?.trim() || "—"} ·{" "}
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!session.isCurrent ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revokingId === session.id || revokingAll}
                    onClick={() => void revokeSession(session.id)}
                  >
                    {revokingId === session.id
                      ? "Signing out…"
                      : "Sign out this device"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
