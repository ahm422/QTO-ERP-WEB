import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Card variants for different styles
const cardVariants = cva(
  "relative flex flex-col overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        // Lift is driven by Framer cardHover on consumers — CSS only handles border/shadow
        default:
          "bg-card border border-border shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)]",
        outlined: "bg-transparent border-2 border-border hover:border-border/80",
        filled: "bg-muted border-0 shadow-inner",
        gradient:
          "bg-gradient-to-br from-accent to-accent-dark border-0 text-accent-foreground shadow-[var(--shadow-lg)] shadow-accent/25 hover:shadow-accent/40",
        glass:
          "bg-card/10 backdrop-blur-xl border border-border/20 shadow-[var(--card-shadow)]",
        elevated:
          "bg-card border-0 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)]",
        interactive:
          "bg-card border border-border cursor-pointer shadow-[var(--card-shadow)] hover:border-accent hover:shadow-[var(--card-shadow-hover)] group",
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
          gradient && "bg-linear-to-r from-accent to-accent-dark bg-clip-text text-transparent",
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
        className={cn("text-sm text-muted-foreground leading-relaxed", className)}
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
            className="w-full h-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
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
      default: "bg-muted text-muted-foreground",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      error: "bg-destructive/10 text-destructive",
      info: "bg-info/10 text-info",
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
const CardIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg"; color?: "default" | "gradient" | "accent" }>(
  ({ className, size = "md", color = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    }

    const colorClasses = {
      default: "bg-muted text-muted-foreground",
      gradient: "bg-gradient-to-br from-accent to-accent-dark text-accent-foreground shadow-lg shadow-accent/30",
      accent: "bg-accent/10 text-accent",
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
