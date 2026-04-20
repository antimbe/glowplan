"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  primary: {
    iconBg: "bg-[#32422c]/10 border border-[#32422c]/15",
    iconColor: "text-[#32422c]",
    accent: "from-transparent via-[#c0a062]/50 to-transparent",
  },
  danger: {
    iconBg: "bg-red-50 border border-red-100",
    iconColor: "text-red-500",
    accent: "from-transparent via-red-300/50 to-transparent",
  },
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

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] w-full max-h-[90vh] overflow-hidden mx-2 lg:mx-0 animate-in fade-in zoom-in-95 duration-200",
        maxWidthStyles[maxWidth]
      )}>

        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${styles.accent} z-10`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80">
          <div className="flex items-center gap-3.5">
            {icon && (
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", styles.iconBg)}>
                <span className={styles.iconColor}>{icon}</span>
              </div>
            )}
            <div>
              <h3 className="text-[16px] font-black text-gray-900 tracking-tight leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-gray-400 text-xs font-medium mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 lg:p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 px-5 py-4 lg:px-6 bg-gray-50/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
