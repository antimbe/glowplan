"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "danger" | "light";
  size?: "sm" | "md" | "lg";
  icon: ReactNode;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      default: "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700",
      ghost: "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
      outline: "border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700",
      danger: "bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700",
      light: "bg-white/10 hover:bg-white/20 text-white",
    };

    const sizes = {
      sm: "w-7 h-7",
      md: "w-8 h-8",
      lg: "w-10 h-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
