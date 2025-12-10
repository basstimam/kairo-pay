import { cn } from "@/lib/utils";
import React from "react";

export function Container({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
