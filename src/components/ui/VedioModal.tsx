'use client';
import { motion} from 'framer-motion';

export function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-2 max-w-3xl w-full mx-4 mega-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
          Video Player Placeholder
        </div>
        <button onClick={onClose} className="mt-2 w-full text-center text-sm text-muted-foreground py-2 hover:text-foreground transition-colors">
          Close
        </button>
      </motion.div>
    </div>
  );
}