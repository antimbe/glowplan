"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import IconButton from "./IconButton";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "primary" | "danger";
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-gradient-to-r from-primary to-primary/80",
  danger: "bg-gradient-to-r from-red-500 to-red-400",
};

const maxWidthStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  variant = "primary",
  children,
  footer,
  maxWidth = "md",
}: FormModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white rounded-2xl lg:rounded-3xl border border-gray-100 shadow-2xl w-full max-h-[90vh] overflow-hidden mx-2 lg:mx-0 animate-in fade-in zoom-in-95 duration-200",
        maxWidthStyles[maxWidth]
      )}>
        {/* Header */}
        <div className={cn("p-4 lg:p-5", variantStyles[variant])}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-white text-base lg:text-lg font-bold">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-white/70 text-xs lg:text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            <IconButton
              variant="light"
              size="md"
              icon={<X size={18} />}
              onClick={onClose}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 p-4 lg:p-5 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
