import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "primary" | "secondary" | "muted";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      variant = "default",
      spacing = "lg",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-white",
      primary: "bg-[#32422c] text-white",
      secondary: "bg-[#f3f4f6]",
      muted: "bg-gray-50",
    };

    const spacings = {
      none: "py-0",
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-24 md:py-32",
      xl: "py-32 md:py-48",
    };

    return (
      <section
        ref={ref}
        className={cn(variants[variant], spacings[spacing], className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export default Section;
