"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import type { ContactPageContent } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyOption = () => ({ value: "", label: "" });

export function ContactFormEditor() {
  const [page, setPage] = useState<ContactPageContent>({
    sideTitle: "",
    sideDescription: "",
    formFieldOptions: {
      labels: {
        name: "",
        email: "",
        phone: "",
        company: "",
        companySize: "",
        subject: "",
        message: "",
      },
      placeholders: {
        name: "",
        email: "",
        phone: "",
        company: "",
        companySize: "",
        subject: "",
        message: "",
      },
      companySizes: [],
      subjects: [],
    },
    faqTag: "",
    faqTitle: "",
    faqDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; page: ContactPageContent }>(
        "/api/admin/contact/page",
      );
      setPage(data.page);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load form",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminFetch<{ ok: true; page: ContactPageContent }>(
        "/api/admin/contact/page",
        { method: "PUT", json: page },
      );
      setPage(data.page);
      toast.success("Form content saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const { formFieldOptions: form } = page;

  return (
    <div className="space-y-6 rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="side-title">Side panel title</Label>
          <Input
            id="side-title"
            className="mt-1"
            value={page.sideTitle}
            onChange={(e) =>
              setPage((p) => ({ ...p, sideTitle: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="side-description">Side panel description</Label>
          <Textarea
            id="side-description"
            className="mt-1"
            rows={2}
            value={page.sideDescription}
            onChange={(e) =>
              setPage((p) => ({ ...p, sideDescription: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Form labels & placeholders</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              "name",
              "email",
              "phone",
              "company",
              "companySize",
              "subject",
              "message",
            ] as const
          ).map((field) => (
            <div key={field} className="space-y-2 rounded-md border p-3">
              <Label className="capitalize">{field}</Label>
              <Input
                placeholder="Label"
                value={form.labels[field]}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    formFieldOptions: {
                      ...p.formFieldOptions,
                      labels: {
                        ...p.formFieldOptions.labels,
                        [field]: e.target.value,
                      },
                    },
                  }))
                }
              />
              <Input
                placeholder="Placeholder"
                value={form.placeholders[field]}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    formFieldOptions: {
                      ...p.formFieldOptions,
                      placeholders: {
                        ...p.formFieldOptions.placeholders,
                        [field]: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Company sizes</h3>
        {form.companySizes.map((opt, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Value"
              value={opt.value}
              onChange={(e) =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    companySizes: p.formFieldOptions.companySizes.map(
                      (o, i) =>
                        i === index ? { ...o, value: e.target.value } : o,
                    ),
                  },
                }))
              }
            />
            <Input
              placeholder="Label"
              value={opt.label}
              onChange={(e) =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    companySizes: p.formFieldOptions.companySizes.map(
                      (o, i) =>
                        i === index ? { ...o, label: e.target.value } : o,
                    ),
                  },
                }))
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    companySizes: p.formFieldOptions.companySizes.filter(
                      (_, i) => i !== index,
                    ),
                  },
                }))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((p) => ({
              ...p,
              formFieldOptions: {
                ...p.formFieldOptions,
                companySizes: [
                  ...p.formFieldOptions.companySizes,
                  emptyOption(),
                ],
              },
            }))
          }
        >
          <Plus className="mr-1 size-4" />
          Add company size
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Subjects</h3>
        {form.subjects.map((opt, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Value"
              value={opt.value}
              onChange={(e) =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    subjects: p.formFieldOptions.subjects.map((o, i) =>
                      i === index ? { ...o, value: e.target.value } : o,
                    ),
                  },
                }))
              }
            />
            <Input
              placeholder="Label"
              value={opt.label}
              onChange={(e) =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    subjects: p.formFieldOptions.subjects.map((o, i) =>
                      i === index ? { ...o, label: e.target.value } : o,
                    ),
                  },
                }))
              }
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() =>
                setPage((p) => ({
                  ...p,
                  formFieldOptions: {
                    ...p.formFieldOptions,
                    subjects: p.formFieldOptions.subjects.filter(
                      (_, i) => i !== index,
                    ),
                  },
                }))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((p) => ({
              ...p,
              formFieldOptions: {
                ...p.formFieldOptions,
                subjects: [...p.formFieldOptions.subjects, emptyOption()],
              },
            }))
          }
        >
          <Plus className="mr-1 size-4" />
          Add subject
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="submit-label">Submit button label</Label>
          <Input
            id="submit-label"
            className="mt-1"
            value={form.submitLabel ?? ""}
            onChange={(e) =>
              setPage((p) => ({
                ...p,
                formFieldOptions: {
                  ...p.formFieldOptions,
                  submitLabel: e.target.value,
                },
              }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="success-message">Success message</Label>
          <Textarea
            id="success-message"
            className="mt-1"
            rows={2}
            value={form.successMessage ?? ""}
            onChange={(e) =>
              setPage((p) => ({
                ...p,
                formFieldOptions: {
                  ...p.formFieldOptions,
                  successMessage: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-medium">FAQ section header</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="faq-tag">Tag</Label>
            <Input
              id="faq-tag"
              className="mt-1"
              value={page.faqTag}
              onChange={(e) =>
                setPage((p) => ({ ...p, faqTag: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="faq-title">Title</Label>
            <Input
              id="faq-title"
              className="mt-1"
              value={page.faqTitle}
              onChange={(e) =>
                setPage((p) => ({ ...p, faqTitle: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="faq-description">Description</Label>
            <Textarea
              id="faq-description"
              className="mt-1"
              rows={2}
              value={page.faqDescription}
              onChange={(e) =>
                setPage((p) => ({ ...p, faqDescription: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save form content"}
      </Button>
    </div>
  );
}
