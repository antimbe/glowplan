"use client";

import { SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      options,
      placeholder,
      fullWidth = false,
      disabled,
      size = "md",
      ...props
    },
    ref
  ) => {
    const baseStyles = "appearance-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 bg-white cursor-pointer rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50";

    const sizes = {
      sm: "h-9 px-3 text-sm pr-8",
      md: "h-11 px-4 text-sm pr-10",
      lg: "h-12 px-4 text-base pr-10",
    };

    const stateStyles = error
      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
      : "";

    return (
      <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
        {label && (
          <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
            {leftIcon}
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              baseStyles,
              sizes[size],
              stateStyles,
              fullWidth && "w-full",
              className
            )}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown 
            size={16} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          />
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
        {helperText && !error && (
          <span className="text-sm text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
