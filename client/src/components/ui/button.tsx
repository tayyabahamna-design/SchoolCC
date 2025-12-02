import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-primary-border",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-destructive-foreground shadow-md hover:shadow-lg border-0",
        outline:
          "border-2 border-border bg-background text-foreground hover:bg-muted/50 shadow-sm",
        secondary:
          "bg-gradient-subtle text-foreground border border-border hover:bg-muted shadow-sm",
        ghost: "border border-transparent hover:bg-muted/30 text-foreground",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
        accent:
          "bg-gradient-to-br from-accent to-green-600 text-accent-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 border-0",
      },
      size: {
        default: "min-h-10 px-5 py-2.5",
        sm: "min-h-8 rounded-md px-3 text-xs font-medium",
        lg: "min-h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
