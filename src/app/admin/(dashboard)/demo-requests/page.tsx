"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
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
import { Textarea } from "@/components/ui/textarea";
import { demoRequestStatusVariant } from "@/lib/status-variants";

type LeadStatus = "NEW" | "READ" | "ARCHIVED";

type DemoRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyPhone: string | null;
  country: string;
  company: string | null;
  businessType: string;
  status: LeadStatus;
  createdAt: string;
};

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyTarget, setReplyTarget] = useState<DemoRequest | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const data = await adminFetch<{ ok: true; requests: DemoRequest[] }>(
        `/api/admin/demo-requests${query}`,
      );
      setRequests(data.requests);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load requests",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    try {
      const data = await adminFetch<{ ok: true; request: DemoRequest }>(
        `/api/admin/demo-requests/${id}`,
        { method: "PATCH", json: { status } },
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? data.request : r)),
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to update status",
      );
    }
  };

  const openReply = (request: DemoRequest) => {
    setReplyTarget(request);
    setSubject(`Re: Your QTO ERP demo request`);
    setBody(
      `Thank you for your interest in QTO ERP.\n\nWe received your request from ${request.country} (${request.businessType}).\n\n`,
    );
  };

  const sendReply = async () => {
    if (!replyTarget) return;
    setSending(true);
    try {
      const data = await adminFetch<{ ok: true; request: DemoRequest }>(
        `/api/admin/demo-requests/${replyTarget.id}/reply`,
        { method: "POST", json: { subject, body } },
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === replyTarget.id ? data.request : r)),
      );
      toast.success("Reply sent");
      setReplyTarget(null);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to send reply",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Demo requests</h1>
          <p className="text-sm text-muted-foreground">
            Review inbound demo form submissions and reply by email.
          </p>
        </div>
        <div className="w-40">
          <Label htmlFor="status-filter">Filter status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Client phone</TableHead>
                <TableHead>Company phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState title="No demo requests found." />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone ?? "—"}</TableCell>
                    <TableCell>{r.companyPhone ?? "—"}</TableCell>
                    <TableCell>{r.country}</TableCell>
                    <TableCell>{r.businessType}</TableCell>
                    <TableCell>
                      <Badge variant={demoRequestStatusVariant[r.status]}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          value={r.status}
                          onValueChange={(v) =>
                            updateStatus(r.id, v as LeadStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">NEW</SelectItem>
                            <SelectItem value="READ">READ</SelectItem>
                            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openReply(r)}
                        >
                          Reply
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!replyTarget} onOpenChange={() => setReplyTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.name}</DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                To: <span className="text-foreground">{replyTarget.email}</span>
              </p>
              <p>
                Client phone:{" "}
                <span className="text-foreground">
                  {replyTarget.phone ?? "—"}
                </span>
              </p>
              <p>
                Company phone:{" "}
                <span className="text-foreground">
                  {replyTarget.companyPhone ?? "—"}
                </span>
              </p>
              <p>
                {replyTarget.country} · {replyTarget.businessType}
                {replyTarget.company ? ` · ${replyTarget.company}` : ""}
              </p>
              <div className="space-y-2">
                <Label htmlFor="reply-subject">Subject</Label>
                <Input
                  id="reply-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-body">Message</Label>
                <Textarea
                  id="reply-body"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReplyTarget(null)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={sendReply} disabled={sending}>
              {sending ? "Sending…" : "Send reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
