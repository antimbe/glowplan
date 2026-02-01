import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import Flex, { FlexProps } from "./Flex";

export interface StackProps extends Omit<FlexProps, "direction"> {
  space?: number | string;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, space = 4, ...props }, ref) => {
    return (
      <Flex
        ref={ref}
        direction="col"
        gap={space}
        className={className}
        {...props}
      />
    );
  }
);

Stack.displayName = "Stack";

export default Stack;
