"use client";

import {
  createElement,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  Video as VideoIcon,
  X,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover } from "radix-ui";
import { toast } from "sonner";
import { adminUpload } from "@/lib/admin-fetch";
import {
  CMS_ICONS,
  CMS_ICON_KEYS,
  getCmsIcon,
} from "@/lib/cms-icons";
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

/**
 * Searchable icon picker backed by the shared `CMS_ICONS` registry. Stores the
 * kebab-case key; renders the real glyph in the trigger and the grid.
 */
export function IconPickerField({
  label,
  hint,
  value,
  onChange,
  full,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CMS_ICON_KEYS;
    return CMS_ICON_KEYS.filter(
      (key) =>
        key.includes(q) || CMS_ICONS[key].label.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Field label={label} hint={hint} full={full}>
      <div className="flex items-center gap-2">
        <Popover.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setQuery("");
          }}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {value ? (
                createElement(getCmsIcon(value), {
                  className: "size-4 shrink-0 text-foreground",
                })
              ) : (
                <UploadCloud className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "truncate",
                  !value && "text-muted-foreground",
                )}
              >
                {value ? (CMS_ICONS[value]?.label ?? value) : "Choose icon"}
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-[320px] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md"
            >
              <div className="mb-2 flex items-center gap-2 rounded-md border border-input px-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search icons…"
                  className="h-9 w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
                {results.map((key) => {
                  const { Icon, label: iconLabel } = CMS_ICONS[key];
                  const selected = key === value;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={iconLabel}
                      aria-label={iconLabel}
                      onClick={() => {
                        onChange(key);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-transparent",
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
                {results.length === 0 ? (
                  <p className="col-span-6 px-1 py-6 text-center text-xs text-muted-foreground">
                    No icons match &ldquo;{query}&rdquo;.
                  </p>
                ) : null}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {value ? (
          <button
            type="button"
            aria-label="Clear icon"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive"
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
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

async function uploadVideo(endpoint: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const data = await adminUpload<{ objectKey?: string; videoUrl?: string }>(
    endpoint,
    fd,
  );
  if (!data.objectKey) throw new Error("Upload failed");
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

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Video field storing an R2 object key (mirrors {@link ImageField}). Accepts a
 * click-to-pick file **and** drag-and-drop; shows filename + size while
 * uploading and a `<video>` preview once the upload resolves.
 */
export function VideoField({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [meta, setMeta] = useState<{ name: string; size: number } | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    if (!["video/mp4", "video/webm"].includes(file.type)) {
      toast.error("Only MP4 and WebM videos are allowed");
      return;
    }
    setMeta({ name: file.name, size: file.size });
    setBusy(true);
    try {
      const key = await uploadVideo(uploadEndpoint, file);
      onChange(key, URL.createObjectURL(file));
      toast.success("Video uploaded — save the section to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setMeta(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint} full>
      <div className="space-y-3 rounded-lg border border-border bg-card p-3">
        {previewUrl ? (
          <video
            src={previewUrl}
            controls
            muted
            className="max-h-56 w-full rounded-md border border-border bg-black"
          />
        ) : null}

        <div
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !busy) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
            dragActive
              ? "border-accent bg-accent/5 text-accent"
              : "border-border text-muted-foreground hover:border-accent hover:text-accent",
            busy && "pointer-events-none opacity-70",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>Uploading{meta ? ` ${meta.name}` : ""}…</span>
            </>
          ) : (
            <>
              <VideoIcon className="size-5" />
              <span>
                {objectKey || previewUrl
                  ? "Drop a new video or click to replace"
                  : "Drop an MP4/WebM here or click to choose"}
              </span>
            </>
          )}
          {meta && !busy ? (
            <span className="text-xs text-muted-foreground">
              {meta.name} · {humanSize(meta.size)}
            </span>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {objectKey ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => {
              onChange("", "");
              setMeta(null);
            }}
          >
            Remove video
          </button>
        ) : null}
      </div>
    </Field>
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useReducedMotionPref(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

type SortableRowProps = {
  id: string;
  index: number;
  count: number;
  preview?: string;
  reducedMotion: boolean;
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (i: number) => void;
  children: ReactNode;
};

function SortableRow({
  id,
  index,
  count,
  preview,
  reducedMotion,
  onMove,
  onRemove,
  children,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: reducedMotion ? undefined : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "space-y-4 rounded-xl border border-border bg-muted/30 p-5",
        isDragging && "relative z-10 opacity-80 shadow-lg",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label="Drag to reorder"
            className="cursor-grab touch-none rounded p-0.5 hover:bg-background active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 shrink-0" />
          </button>
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
            {index + 1}
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
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onMove(index, 1)}
            disabled={index === count - 1}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-4 lg:grid-cols-2">{children}</div>
    </div>
  );
}

/** Generic repeatable list of structured rows with add / remove / drag-reorder. */
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
  const reducedMotion = useReducedMotionPref();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = items.map((_, i) => `row-${i}`);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    onChange(arrayMove(items, i, j));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onChange(arrayMove(items, from, to));
  };

  return (
    <Field label={label} hint={hint} full>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : null}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {items.map((item, i) => (
              <SortableRow
                key={ids[i]}
                id={ids[i]}
                index={i}
                count={items.length}
                preview={rowTitle?.(item)?.trim()}
                reducedMotion={reducedMotion}
                onMove={move}
                onRemove={(idx) =>
                  onChange(items.filter((_, j) => j !== idx))
                }
              >
                {renderRow(
                  item,
                  (patch) => {
                    const next = [...items];
                    next[i] = { ...item, ...patch };
                    onChange(next);
                  },
                  i,
                )}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
        <AddButton
          label={addLabel}
          onClick={() => onChange([...items, makeEmpty()])}
        />
      </div>
    </Field>
  );
}
