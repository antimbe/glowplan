import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import Box from "./Box";

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  icon?: ReactNode;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("flex items-start gap-3", className)}
        {...props}
      >
        {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className="flex-1">{children}</div>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  spacing?: "sm" | "md" | "lg";
}

const List = forwardRef<HTMLUListElement, ListProps>(
  ({ className, spacing = "md", children, ...props }, ref) => {
    const spacings = {
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
    };

    return (
      <ul
        ref={ref}
        className={cn("list-none p-0 m-0", spacings[spacing], className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);

List.displayName = "List";

export default List;
