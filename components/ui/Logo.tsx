import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ className, size = "md", variant = "light", ...props }, ref) => {
    const dimensions = {
      sm: { width: 80, height: 40 },
      md: { width: 100, height: 50 },
      lg: { width: 120, height: 60 },
      xl: { width: 160, height: 80 },
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          className
        )}
        {...props}
      >
        <Image
          src="/logo.png"
          alt="GlowPlan Logo"
          width={dimensions[size].width}
          height={dimensions[size].height}
          className="object-contain"
          priority
        />
      </div>
    );
  }
);

Logo.displayName = "Logo";

export default Logo;
