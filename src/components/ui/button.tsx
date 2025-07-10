
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold-whisper text-pure-white hover:bg-gold-whisper/90 font-medium",
        destructive:
          "bg-soft-crimson text-pure-white hover:bg-soft-crimson/90 font-medium",
        outline:
          "border border-satin-silver bg-pure-white text-deep-charcoal hover:bg-soft-ivory hover:text-deep-charcoal font-medium",
        secondary:
          "bg-satin-silver text-deep-charcoal hover:bg-satin-silver/80 font-medium",
        ghost: "text-deep-charcoal hover:bg-soft-ivory hover:text-deep-charcoal font-medium",
        link: "text-gold-whisper underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
        style={{
          color: variant === 'default' ? 'hsl(var(--pure-white))' : 
                variant === 'destructive' ? 'hsl(var(--pure-white))' :
                'hsl(var(--deep-charcoal))'
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
