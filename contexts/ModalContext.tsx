"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Modal, { ModalVariant } from "@/components/ui/Modal";

interface ModalOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({
    title: "",
    message: "",
  });

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal({ title, message, variant: "success" });
  }, [showModal]);

  const showError = useCallback((title: string, message: string) => {
    showModal({ title, message, variant: "error" });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal({ title, message, variant: "info" });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal({ title, message, variant: "warning" });
  }, [showModal]);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    showModal({
      title,
      message,
      variant: "warning",
      showCancel: true,
      confirmText: "Confirmer",
      onConfirm,
    });
  }, [showModal]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showConfirm,
        closeModal,
      }}
    >
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalOptions.title}
        message={modalOptions.message}
        variant={modalOptions.variant}
        confirmText={modalOptions.confirmText}
        cancelText={modalOptions.cancelText}
        onConfirm={modalOptions.onConfirm}
        showCancel={modalOptions.showCancel}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
