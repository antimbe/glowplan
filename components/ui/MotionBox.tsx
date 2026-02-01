import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface MotionBoxProps extends HTMLMotionProps<"div"> {
  as?: any;
}

const MotionBox = forwardRef<HTMLDivElement, MotionBoxProps>(
  ({ className, as: Tag = "div", ...props }, ref) => {
    const Component = motion(Tag);
    return (
      <Component
        ref={ref}
        className={cn(
          props.onClick && "cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

MotionBox.displayName = "MotionBox";

export default MotionBox;
