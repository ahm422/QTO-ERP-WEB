import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Card variants for different styles
const cardVariants = cva(
  "relative flex flex-col overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md",
        outlined: "bg-transparent border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
        filled: "bg-slate-50 dark:bg-slate-800/50 border-0 shadow-inner",
        gradient: "bg-gradient-to-br from-orange-500 to-amber-600 border-0 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40",
        glass: "bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl",
        elevated: "bg-white dark:bg-slate-900 border-0 shadow-lg hover:shadow-xl hover:-translate-y-1",
        interactive: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 group",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "lg",
      padding: "md",
    },
  }
)

// Card Component
interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, radius, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, radius, padding }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// Card Header
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5",
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

// Card Title with gradient support
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }>(
  ({ className, gradient = false, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "font-semibold leading-tight tracking-tight text-lg",
          gradient && "bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent",
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

// Card Description
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-slate-500 dark:text-slate-400 leading-relaxed", className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = "CardDescription"

// Card Content
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1", className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = "CardContent"

// Card Footer
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 pt-4 mt-auto", className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

// Card Action - for buttons/actions in header
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("ml-auto flex items-center gap-2", className)}
        {...props}
      />
    )
  }
)
CardAction.displayName = "CardAction"

// Card Image - for cards with images
const CardImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string; overlay?: boolean }>(
  ({ className, src, alt, overlay = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {src && (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {overlay && (
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        )}
        {children}
      </div>
    )
  }
)
CardImage.displayName = "CardImage"

// Card Badge - for status/labels
const CardBadge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { color?: "default" | "success" | "warning" | "error" | "info" }>(
  ({ className, color = "default", ...props }, ref) => {
    const colorClasses = {
      default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)
CardBadge.displayName = "CardBadge"

// Card Icon - for icon containers
const CardIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg"; color?: "default" | "gradient" | "orange" }>(
  ({ className, size = "md", color = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    }

    const colorClasses = {
      default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-xl",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)
CardIcon.displayName = "CardIcon"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardImage,
  CardBadge,
  CardIcon,
  cardVariants,
}