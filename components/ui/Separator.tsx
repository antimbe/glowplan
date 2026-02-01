import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "muted";
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-200",
      muted: "bg-gray-100",
    };

    return (
      <div
        ref={ref}
        className={cn(
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

export default Separator;
