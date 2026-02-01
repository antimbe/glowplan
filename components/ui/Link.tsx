import { AnchorHTMLAttributes, forwardRef } from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils/cn";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "default" | "primary" | "muted" | "underline";
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, variant = "default", children, ...props }, ref) => {
    const baseStyles = "transition-all duration-200 cursor-pointer";
    
    const variants = {
      default: "text-inherit hover:opacity-80",
      primary: "text-primary hover:text-primary-light",
      muted: "text-white/60 hover:text-white",
      underline: "relative group py-1",
    };

    const isInternal = href.startsWith("/") || href.startsWith("#");

    const content = (
      <>
        {children}
        {variant === "underline" && (
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-80" />
        )}
      </>
    );

    if (isInternal) {
      return (
        <NextLink
          href={href}
          ref={ref as any}
          className={cn(baseStyles, variants[variant], className)}
          {...props}
        >
          {content}
        </NextLink>
      );
    }

    return (
      <a
        href={href}
        ref={ref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {content}
      </a>
    );
  }
);

Link.displayName = "Link";

export default Link;
