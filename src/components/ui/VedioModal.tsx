"use client";

import { motion, useReducedMotion } from "framer-motion";

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playbackUrl?: string | null;
  title?: string;
  contentType?: string;
  loading?: boolean;
  error?: string | null;
};

export function VideoModal({
  isOpen,
  onClose,
  playbackUrl,
  title,
  contentType,
  loading,
  error,
}: VideoModalProps) {
  const reduced = useReducedMotion();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-2 max-w-3xl w-full mx-4 mega-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <p className="px-2 pt-2 text-sm font-medium text-foreground">{title}</p>
        ) : null}
        <div className="aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center text-muted-foreground mt-2">
          {loading ? (
            <p className="text-sm">Loading video…</p>
          ) : error ? (
            <p className="text-sm text-destructive px-4 text-center">{error}</p>
          ) : playbackUrl ? (
            <video
              key={playbackUrl}
              src={playbackUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain bg-black"
            >
              <source src={playbackUrl} type={contentType ?? "video/mp4"} />
            </video>
          ) : (
            <p className="text-sm px-4 text-center">No demo video available.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full text-center text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
