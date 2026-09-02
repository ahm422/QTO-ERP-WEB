"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/db/enums";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  disabledAt: string | null;
};

const ROLE_OPTIONS: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export default function AdminUsersPage() {
  const { can, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("EDITOR");
  const [inviting, setInviting] = useState(false);

  const canManage = can("users:manage");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const data = await adminFetch<{ ok: true; users: AdminUser[] }>(
        `/api/admin/users${query}`,
      );
      setUsers(data.users);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (canManage) {
      void load();
    } else {
      setLoading(false);
    }
  }, [canManage, load]);

  const updateRole = async (id: string, role: Role) => {
    try {
      const data = await adminFetch<{ ok: true; user: AdminUser }>(
        `/api/admin/users/${id}`,
        { method: "PATCH", json: { role } },
      );
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to update role",
      );
    }
  };

  const setDisabled = async (id: string, disabled: boolean) => {
    try {
      const data = await adminFetch<{ ok: true; user: AdminUser }>(
        `/api/admin/users/${id}`,
        { method: "PATCH", json: { disabled } },
      );
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      toast.success(disabled ? "User deactivated" : "User reactivated");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to update status",
      );
    }
  };

  const sendInvite = async () => {
    setInviting(true);
    try {
      const data = await adminFetch<{ ok: true; user: AdminUser }>(
        "/api/admin/users",
        {
          method: "POST",
          json: {
            email: inviteEmail,
            name: inviteName || undefined,
            role: inviteRole,
          },
        },
      );
      setUsers((prev) => [data.user, ...prev]);
      toast.success("Invite sent");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("EDITOR");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to invite user",
      );
    } finally {
      setInviting(false);
    }
  };

  if (!canManage) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Invite staff, change roles, and deactivate accounts.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={() => setInviteOpen(true)}>
            Invite user
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0 max-md:block">
                    <EmptyState title="No users found." />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.email === u.email;
                  const isDisabled = u.disabledAt != null;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium" data-label="Email">
                        {u.email}
                      </TableCell>
                      <TableCell data-label="Name">{u.name ?? "—"}</TableCell>
                      <TableCell data-label="Role">
                        <Select
                          value={u.role}
                          onValueChange={(v) => updateRole(u.id, v as Role)}
                          disabled={isDisabled}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell data-label="Status">
                        <Badge variant={isDisabled ? "outline" : "default"}>
                          {isDisabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground"
                        data-label="Created"
                      >
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right max-md:justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isSelf && !isDisabled}
                          onClick={() => setDisabled(u.id, !isDisabled)}
                        >
                          {isDisabled ? "Reactivate" : "Deactivate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name (optional)</Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as Role)}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              An invite email with a set-password link will be sent. No password
              is shown here.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={sendInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
