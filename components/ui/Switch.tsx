"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, size = "md", checked, onChange, disabled, id, ...props }, ref) => {
    const sizes = {
      sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
      md: { track: "w-11 h-6", thumb: "w-5 h-5", translate: "translate-x-5" },
      lg: { track: "w-14 h-7", thumb: "w-6 h-6", translate: "translate-x-7" },
    };

    const labelSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    const sizeConfig = sizes[size];

    return (
      <label 
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-3 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "rounded-full transition-all duration-300",
              sizeConfig.track,
              checked ? "bg-primary" : "bg-gray-200",
              !disabled && "peer-focus:ring-2 peer-focus:ring-primary/20"
            )}
          />
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white rounded-full shadow-sm transition-transform duration-300",
              sizeConfig.thumb,
              checked && sizeConfig.translate
            )}
          />
        </div>
        {label && (
          <span className={cn("text-gray-700 font-medium select-none", labelSizes[size])}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
