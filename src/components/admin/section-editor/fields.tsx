"use client";

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { adminUpload } from "@/lib/admin-fetch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/** Two-column responsive grid; field wrappers opt into full width with `full`. */
export function FormGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-x-6 gap-y-5 lg:grid-cols-2", className)}>
      {children}
    </div>
  );
}

/** Use to make a pair of one-column fields sit side by side inside a FormGrid. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="contents">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  full,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", full && "lg:col-span-2")}>
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  mono,
  full,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <Field label={label} hint={hint} full={full}>
      <Input
        className={mono ? "h-10 font-mono text-sm" : "h-10"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint} full>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SwitchField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 lg:col-span-2">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SelectField({
  label,
  hint,
  value,
  options,
  onChange,
  full,
}: {
  label: string;
  hint?: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <Field label={label} hint={hint} full={full}>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** A list of short strings with add / remove. */
export function StringListField({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint} full>
      <div className="grid gap-2 sm:grid-cols-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input
              className="h-10"
              value={v}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <div className="sm:col-span-2">
          <AddButton label="Add" onClick={() => onChange([...values, ""])} />
        </div>
      </div>
    </Field>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent"
    >
      <Plus className="size-4" />
      {label}
    </button>
  );
}

async function uploadImage(endpoint: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const data = await adminUpload<{ objectKey?: string; imageUrl?: string }>(
    endpoint,
    fd,
  );
  if (!data.objectKey || !data.imageUrl) throw new Error("Upload failed");
  return data.objectKey;
}

/**
 * Image field storing an R2 object key. `previewUrl` is a resolved public URL
 * for the current value (from the serializer); after a new upload a local
 * object-URL preview is shown until the section is saved.
 */
export function ImageField({
  label,
  hint,
  objectKey,
  previewUrl,
  uploadEndpoint,
  onChange,
}: {
  label: string;
  hint?: string;
  objectKey: string;
  previewUrl?: string;
  uploadEndpoint: string;
  onChange: (key: string, url: string) => void;
}) {
  return (
    <Field label={label} hint={hint} full>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <UploadCloud className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            <UploadCloud className="size-4" />
            {objectKey || previewUrl ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/avif,image/png,image/webp,image/jpeg"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const key = await uploadImage(uploadEndpoint, file);
                  onChange(key, URL.createObjectURL(file));
                  toast.success("Image uploaded — save the section to apply");
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Upload failed",
                  );
                }
              }}
            />
          </label>
          {objectKey ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onChange("", "")}
            >
              Remove image
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

/** Generic repeatable list of structured rows with add / remove / reorder. */
export function RepeatableList<T>({
  label,
  hint,
  items,
  onChange,
  makeEmpty,
  renderRow,
  rowTitle,
  addLabel = "Add item",
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  renderRow: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number,
  ) => ReactNode;
  /** Optional short preview label for a row (e.g. its title). */
  rowTitle?: (item: T) => string;
  addLabel?: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <Field label={label} hint={hint} full>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : null}
        {items.map((item, i) => {
          const preview = rowTitle?.(item)?.trim();
          return (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-border bg-muted/30 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <GripVertical className="size-4 shrink-0" />
                  <span className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                    {i + 1}
                  </span>
                  {preview ? (
                    <span className="truncate text-sm font-medium text-foreground">
                      {preview}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-x-5 gap-y-4 lg:grid-cols-2">
                {renderRow(
                  item,
                  (patch) => {
                    const next = [...items];
                    next[i] = { ...item, ...patch };
                    onChange(next);
                  },
                  i,
                )}
              </div>
            </div>
          );
        })}
        <AddButton
          label={addLabel}
          onClick={() => onChange([...items, makeEmpty()])}
        />
      </div>
    </Field>
  );
}
