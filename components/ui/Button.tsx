import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : "button";
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full active:scale-95 cursor-pointer";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-light focus:ring-primary shadow-lg shadow-primary/20 hover:shadow-primary/40",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-gray-200 focus:ring-gray-200",
      outline:
        "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-lg shadow-red-600/20",
      ghost: "text-primary hover:bg-primary/5 focus:ring-primary",
      white: "bg-white text-primary hover:bg-gray-50 focus:ring-white shadow-lg",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-2.5",
      xl: "px-10 py-5 text-xl gap-3 font-semibold",
    };

    return (
      <Component
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? children : (
          <>
            {loading && <Loader2 className="animate-spin" size={20} />}
            {children}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;
