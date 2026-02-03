import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 uppercase tracking-wider";

    const variants = {
      default: "bg-gray-100 text-gray-600 border border-gray-200",
      primary: "bg-primary/10 text-primary border border-primary/20",
      secondary: "bg-secondary text-primary border border-gray-200",
      success: "bg-primary/10 text-primary border border-primary/20",
      danger: "bg-red-50 text-red-700 border border-red-200",
      outline: "bg-transparent border-2 border-primary text-primary",
    };

    const sizes = {
      sm: "px-2.5 py-0.5 text-[10px]",
      md: "px-3 py-1 text-xs",
      lg: "px-4 py-1.5 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          props.onClick && "cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
