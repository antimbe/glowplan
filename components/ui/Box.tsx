import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article" | "main" | "header" | "footer" | "nav" | "aside" | "span";
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ className, as: Tag = "div", children, ...props }, ref) => {
    return (
      <Tag 
        ref={ref} 
        className={cn(
          props.onClick && "cursor-pointer",
          className
        )} 
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Box.displayName = "Box";

export default Box;
