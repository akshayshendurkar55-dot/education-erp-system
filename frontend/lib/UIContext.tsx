"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckIcon, AlertCircleIcon, CloseIcon } from "../app/components/Icons";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

interface UIContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (options: ConfirmDialogOptions) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmAction = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    try {
      setIsConfirming(true);
      await confirmDialog.onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    if (isConfirming) return;
    setConfirmDialog(null);
  };

  return (
    <UIContext.Provider
      value={{
        showToast,
        confirmAction,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
      }}
    >
      {children}

      {/* Toast Notification Container */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "380px",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const bgColors = {
            success: "#f0fdf4",
            error: "#fef2f2",
            warning: "#fffbeb",
            info: "#eff6ff",
          };
          const borderColors = {
            success: "#86efac",
            error: "#fca5a5",
            warning: "#fde68a",
            info: "#93c5fd",
          };
          const textColors = {
            success: "#15803d",
            error: "#b91c1c",
            warning: "#b45309",
            info: "#1d4ed8",
          };

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: "auto",
                background: bgColors[toast.type],
                border: `1px solid ${borderColors[toast.type]}`,
                color: textColors[toast.type],
                padding: "12px 16px",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "14px",
                fontWeight: 500,
                animation: "slideIn 0.2s ease-out",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {toast.type === "success" ? (
                  <CheckIcon size={18} />
                ) : (
                  <AlertCircleIcon size={18} />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  opacity: 0.7,
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Accessible Confirmation Modal Dialog */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: confirmDialog.isDestructive ? "#fee2e2" : "#eff6ff",
                  color: confirmDialog.isDestructive ? "#dc2626" : "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircleIcon size={22} />
              </div>
              <h3
                id="confirm-dialog-title"
                style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}
              >
                {confirmDialog.title}
              </h3>
            </div>

            <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleCancel}
                style={{
                  padding: "9px 18px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: isConfirming ? "not-allowed" : "pointer",
                }}
              >
                {confirmDialog.cancelLabel || "Cancel"}
              </button>

              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirm}
                style={{
                  padding: "9px 18px",
                  borderRadius: "6px",
                  border: "none",
                  background: confirmDialog.isDestructive ? "#dc2626" : "#1e3a8a",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: isConfirming ? "not-allowed" : "pointer",
                }}
              >
                {isConfirming
                  ? "Processing..."
                  : confirmDialog.confirmLabel || (confirmDialog.isDestructive ? "Delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
