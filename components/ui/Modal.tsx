"use client";

import { useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ModalVariant = "success" | "error" | "info" | "warning";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    iconBg: "bg-[#32422c]/8",
    iconColor: "text-[#32422c]",
    accent: "from-[#32422c]/0 via-[#c0a062]/50 to-[#32422c]/0",
    buttonBg: "bg-[#32422c] hover:bg-[#3d5438] shadow-[#32422c]/20",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    accent: "from-transparent via-red-300/50 to-transparent",
    buttonBg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    accent: "from-transparent via-blue-300/50 to-transparent",
    buttonBg: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    accent: "from-transparent via-amber-300/50 to-transparent",
    buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  confirmText = "OK",
  cancelText = "Annuler",
  onConfirm,
  showCancel = false,
}: ModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

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

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Top accent */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.accent}`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-150 cursor-pointer z-10"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="px-8 pt-10 pb-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
            <Icon size={30} className={config.iconColor} strokeWidth={1.8} />
          </div>

          {/* Title */}
          <h3 className="text-[19px] font-black text-gray-900 tracking-tight mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 h-11 rounded-xl text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg ${config.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
