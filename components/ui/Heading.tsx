import { HTMLAttributes, forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils/cn";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "hero" | "section" | "card" | "default";
  as?: ElementType;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, variant = "default", as, children, ...props }, ref) => {
    const Tag = as || (`h${level}` as ElementType);

    const variants = {
      hero: "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight",
      section: "text-3xl md:text-4xl font-bold tracking-tight",
      card: "text-xl font-bold tracking-tight",
      default: "font-bold tracking-tight",
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

Heading.displayName = "Heading";

export default Heading;
