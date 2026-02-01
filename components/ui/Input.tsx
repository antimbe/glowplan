import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "ghost";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const baseStyles = "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 text-gray-900";

    const variants = {
      default: "px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
      ghost: "px-0 py-0 border-none bg-transparent focus:outline-none",
    };

    const stateStyles = error
      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
      : variant === "default" ? "hover:border-primary/50" : "";

    return (
      <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className={cn(
              "absolute left-4 text-gray-400",
              variant === "ghost" && "left-0"
            )}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseStyles,
              variants[variant],
              stateStyles,
              leftIcon && (variant === "default" ? "pl-11" : "pl-8"),
              rightIcon && (variant === "default" ? "pr-11" : "pr-8"),
              fullWidth && "w-full",
              className
            )}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              "absolute right-4 text-gray-400",
              variant === "ghost" && "right-0"
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-sm text-red-500 ml-1">{error}</span>}
        {helperText && !error && (
          <span className="text-sm text-gray-500 ml-1">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
