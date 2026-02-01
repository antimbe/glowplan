import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import Box, { BoxProps } from "./Box";

export interface FlexProps extends BoxProps {
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?: number | string;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = "row",
      align = "start",
      justify = "start",
      wrap = "nowrap",
      gap,
      children,
      ...props
    },
    ref
  ) => {
    const directions = {
      row: "flex-row",
      col: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    };

    const alignments = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    };

    const justifications = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };

    const wraps = {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
      "wrap-reverse": "flex-wrap-reverse",
    };

    const gaps: Record<string | number, string> = {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
      16: "gap-16",
    };

    return (
      <Box
        ref={ref}
        className={cn(
          "flex",
          directions[direction],
          alignments[align],
          justifications[justify],
          wraps[wrap],
          gap !== undefined && (gaps[gap] || `gap-[${gap}]`),
          className
        )}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Flex.displayName = "Flex";

export default Flex;
