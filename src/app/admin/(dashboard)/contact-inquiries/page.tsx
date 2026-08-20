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

type LeadStatus = "NEW" | "READ" | "ARCHIVED";

type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  companySize: string | null;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

const statusVariant: Record<
  LeadStatus,
  "default" | "secondary" | "outline"
> = {
  NEW: "default",
  READ: "secondary",
  ARCHIVED: "outline",
};

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyTarget, setReplyTarget] = useState<ContactInquiry | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const data = await adminFetch<{ ok: true; inquiries: ContactInquiry[] }>(
        `/api/admin/contact-inquiries${query}`,
      );
      setInquiries(data.inquiries);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load inquiries",
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
      const data = await adminFetch<{ ok: true; inquiry: ContactInquiry }>(
        `/api/admin/contact-inquiries/${id}`,
        { method: "PATCH", json: { status } },
      );
      setInquiries((prev) =>
        prev.map((r) => (r.id === id ? data.inquiry : r)),
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to update status",
      );
    }
  };

  const openReply = (inquiry: ContactInquiry) => {
    setReplyTarget(inquiry);
    setSubject(`Re: Your QTO ERP inquiry — ${inquiry.subject}`);
    setBody(
      `Thank you for contacting QTO ERP.\n\nWe received your message regarding "${inquiry.subject}".\n\n`,
    );
  };

  const sendReply = async () => {
    if (!replyTarget) return;
    setSending(true);
    try {
      const data = await adminFetch<{ ok: true; inquiry: ContactInquiry }>(
        `/api/admin/contact-inquiries/${replyTarget.id}/reply`,
        { method: "POST", json: { subject, body } },
      );
      setInquiries((prev) =>
        prev.map((r) => (r.id === replyTarget.id ? data.inquiry : r)),
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
          <h1 className="text-2xl font-semibold">Contact inquiries</h1>
          <p className="text-sm text-muted-foreground">
            Review inbound contact form submissions and reply by email.
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
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState title="No contact inquiries found." />
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone ?? "—"}</TableCell>
                    <TableCell>{r.company ?? "—"}</TableCell>
                    <TableCell>{r.subject}</TableCell>
                    <TableCell>{r.companySize ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
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
        <DialogContent className="max-w-lg max-h-[min(90vh,40rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.name}</DialogTitle>
          </DialogHeader>
          {replyTarget && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                To: <span className="text-foreground">{replyTarget.email}</span>
              </p>
              <p>
                {replyTarget.subject}
                {replyTarget.company ? ` · ${replyTarget.company}` : ""}
                {replyTarget.companySize
                  ? ` · ${replyTarget.companySize}`
                  : ""}
              </p>
              <p className="break-words whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-foreground">
                {replyTarget.message}
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
