"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, size = "md", checked, onChange, disabled, ...props }, ref) => {
    const sizes = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const iconSizes = {
      sm: 10,
      md: 12,
      lg: 14,
    };

    const labelSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <label className={cn("inline-flex items-center gap-2 cursor-pointer", disabled && "cursor-not-allowed opacity-50", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "rounded border-2 transition-all duration-200 flex items-center justify-center",
              sizes[size],
              checked
                ? "bg-primary border-primary"
                : "bg-white border-gray-300 peer-hover:border-primary/50",
              disabled && "bg-gray-100 border-gray-200"
            )}
          >
            {checked && <Check size={iconSizes[size]} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && (
          <span className={cn("text-gray-600 select-none", labelSizes[size], disabled && "text-gray-400")}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
