"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required,
  error,
  helperText,
  leftIcon,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
          {leftIcon}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
}
