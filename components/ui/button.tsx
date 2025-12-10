"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-display font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-[2px] active:shadow-none border border-forest cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-forest text-white shadow-[4px_4px_0px_0px_rgba(10,61,42,0.3)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(10,61,42,0.3)]",
        emerald:
          "bg-emerald text-white border-emerald shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,0.3)]",
        secondary:
          "bg-white text-forest shadow-[4px_4px_0px_0px_rgba(10,61,42,0.1)] hover:bg-forest/5",
        ghost: "border-transparent bg-transparent text-forest hover:bg-forest/5 shadow-none",
        link: "text-forest underline-offset-4 hover:underline border-none shadow-none",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-sm px-4",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-14 rounded-lg px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
