import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center rounded-full transition-all cursor-pointer justify-center gap-2 whitespace-nowrap  text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/85 shadow-lg shadow-primary/25 backdrop-blur-md text-primary-foreground border border-primary/20 hover:bg-primary/70 shadow-xs",
        destructive: "bg-destructive/85 backdrop-blur-md text-destructive-foreground border border-destructive/20 hover:bg-destructive/95",
        outline: "border border-input bg-background/60 backdrop-blur-md hover:bg-accent/80 hover:text-accent-foreground",
        secondary: "bg-card/70 backdrop-blur-md text-secondary-foreground border border-border/40 hover:bg-card/90 shadow-xs",
        ghost: "hover:bg-accent/60 hover:backdrop-blur-xs hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9  px-3",
        lg: "h-11  px-8",
        icon: "h-10 w-10 backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
