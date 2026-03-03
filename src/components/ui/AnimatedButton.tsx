"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

interface AnimatedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function AnimatedButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center",
        "px-6 py-2 rounded-full",
        "border border-accent",
        "text-accent font-medium",
        "bg-white",
        "transition-all duration-500 ease-[cubic-bezier(.19,1,.22,1)]",
        "hover:scale-[1.03] active:scale-[0.98]",
        "overflow-hidden group",
        className
      )}
      {...props}
    >
      {/* Animated Border Sweep */}
      <span className="absolute inset-0 rounded-full p-px">
        <span className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-border-sweep" />
      </span>

      {/* Background Tint Layer */}
      <span className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

      {/* Glow Effect */}
      <span className="absolute inset-0 rounded-full shadow-[0_0_0px_rgba(168,85,247,0.0)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-500" />

      {/* Text */}
      <span className="relative z-10 tracking-wide">
        {children}
      </span>
    </button>
  )
}