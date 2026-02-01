import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: "lead" | "default" | "small" | "muted";
  as?: "p" | "span" | "div";
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = "default", as = "p", children, ...props }, ref) => {
    const Tag = as as any;

    const variants = {
       lead: "text-lg md:text-xl font-light leading-relaxed",
       default: "text-base font-medium",
       small: "text-sm font-medium",
       muted: "text-sm text-gray-500 font-medium",
    };

    return (
      <Tag
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Text.displayName = "Text";

export default Text;
