"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table/kit";
import Youtube from "@tiptap/extension-youtube";
import { CharacterCount } from "@tiptap/extensions/character-count";
import { Placeholder } from "@tiptap/extensions/placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { adminUpload } from "@/lib/admin-fetch";
import { BLOG_PROSE_CLASS } from "@/lib/blog-prose";
import { Button, type IconComponent } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BlogEditorProps = {
  postId: string;
  content: string;
  onChange: (html: string) => void;
};

function transformPastedHTML(html: string): string {
  return html
    .replace(/<!--\[if[\s\S]*?endif\]-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(?:o|w|m):[^>]*>/gi, "")
    .replace(/\sclass="[^"]*Mso[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*mso-[^"]*"/gi, "")
    .replace(/\smso-[a-z-]+:[^;"]+;?/gi, "")
    .replace(/<span(?:\s[^>]*)?>\s*<\/span>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

function ToolbarButton({
  editor,
  icon,
  label,
  shortcut,
  active,
  onClick,
}: {
  editor: Editor;
  icon: IconComponent;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
}) {
  const title = shortcut ? `${label} (${shortcut})` : label;
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "default" : "ghost"}
      icon={icon}
      iconPosition="left"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={!editor.isEditable}
    />
  );
}

export function BlogEditor({ postId, content, onChange }: BlogEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: false } }),
      Youtube.configure({
        modestBranding: true,
        nocookie: false,
        width: 640,
        height: 360,
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: "Write your post…",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: `${BLOG_PROSE_CLASS} min-h-[320px] px-3 py-2 focus:outline-none`,
      },
      transformPastedHTML,
    },
  });

  const uploadImage = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("postId", postId);
        formData.append("kind", "inline");

        const result = await adminUpload<{
          ok: true;
          imageUrl: string;
        }>("/api/admin/blog/upload-image", formData);

        editor.chain().focus().setImage({ src: result.imageUrl }).run();
        toast.success("Image inserted");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Image upload failed",
        );
      }
    };
    input.click();
  }, [editor, postId]);

  const openLinkDialog = () => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkUrl(typeof attrs.href === "string" ? attrs.href : "");
    setLinkNewTab(attrs.target === "_blank");
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
      setLinkOpen(false);
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        target: linkNewTab ? "_blank" : null,
      })
      .run();
    setLinkOpen(false);
  };

  const applyYoutube = () => {
    if (!editor) return;
    const url = youtubeUrl.trim();
    if (!url) {
      setYoutubeOpen(false);
      return;
    }
    editor.commands.setYoutubeVideo({ src: url });
    setYoutubeUrl("");
    setYoutubeOpen(false);
  };

  if (!editor) {
    return <p className="text-sm text-muted-foreground">Loading editor…</p>;
  }

  const words = editor.storage.characterCount.words();
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="blog-editor space-y-2">
      <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 rounded-md border border-border bg-background p-1">
        <ToolbarButton
          editor={editor}
          icon={Bold}
          label="Bold"
          shortcut="Ctrl+B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Italic}
          label="Italic"
          shortcut="Ctrl+I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Underline}
          label="Underline"
          shortcut="Ctrl+U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Strikethrough}
          label="Strikethrough"
          shortcut="Ctrl+Shift+S"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Heading1}
          label="Heading 1"
          shortcut="Ctrl+Alt+1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <ToolbarButton
          editor={editor}
          icon={Heading2}
          label="Heading 2"
          shortcut="Ctrl+Alt+2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          editor={editor}
          icon={Heading3}
          label="Heading 3"
          shortcut="Ctrl+Alt+3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <ToolbarButton
          editor={editor}
          icon={Quote}
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Code}
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={List}
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={ListOrdered}
          label="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignLeft}
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignCenter}
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          editor={editor}
          icon={AlignRight}
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarButton
          editor={editor}
          icon={LinkIcon}
          label="Link"
          shortcut="Ctrl+K"
          active={editor.isActive("link")}
          onClick={openLinkDialog}
        />
        <ToolbarButton
          editor={editor}
          icon={ImageIcon}
          label="Image"
          onClick={uploadImage}
        />
        <ToolbarButton
          editor={editor}
          icon={YoutubeIcon}
          label="YouTube"
          onClick={() => setYoutubeOpen(true)}
        />
        <ToolbarButton
          editor={editor}
          icon={Table}
          label="Table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        />
        <ToolbarButton
          editor={editor}
          icon={Minus}
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Undo2}
          label="Undo"
          shortcut="Ctrl+Z"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          editor={editor}
          icon={Redo2}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <div className="rounded-md border border-input bg-background">
        <EditorContent editor={editor} />
      </div>
      <p className="text-xs text-muted-foreground">
        {words} {words === 1 ? "word" : "words"} · {minutes} min read
      </p>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blog-link-url">URL</Label>
              <Input
                id="blog-link-url"
                className="mt-1"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={linkNewTab}
                onCheckedChange={(value) => setLinkNewTab(value === true)}
              />
              Open in new tab
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Remove
            </Button>
            <Button type="button" onClick={applyLink}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed YouTube video</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="blog-youtube-url">YouTube URL</Label>
            <Input
              id="blog-youtube-url"
              className="mt-1"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={applyYoutube}>
              Embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
