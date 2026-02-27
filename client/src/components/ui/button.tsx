import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [box-shadow:var(--shadow-btn-primary)] hover:brightness-110 active:brightness-95 active:[box-shadow:none] border-0",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border hover-elevate active-elevate-2",
        outline:
          "border [border-color:var(--button-outline)] [box-shadow:var(--shadow-btn-secondary)] hover:bg-accent active:[box-shadow:none]",
        secondary: "bg-white dark:bg-secondary text-secondary-foreground [box-shadow:var(--shadow-btn-secondary)] hover:bg-accent active:[box-shadow:none] rounded-lg",
        ghost: "border border-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-[8px] px-3 text-xs",
        lg: "min-h-10 rounded-[10px] px-8",
        icon: "h-9 w-9 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
