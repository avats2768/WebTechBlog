/* ==========================================================================
   ToastContext.jsx
   Place at: src/context/ToastContext.jsx

   Wrap App once in main.jsx, alongside ConfirmProvider:

      <ConfirmProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ConfirmProvider>

   Then anywhere:
      import { useToast } from "../context/ToastContext";
      const toast = useToast();
      toast.success("Changes saved.");
      toast.error("Something went wrong.");
      toast.info("Heads up — this is just info.");
   ========================================================================== */

import { createContext, useCallback, useContext, useState } from "react";
import { Check, X, Info, AlertCircle } from "lucide-react";

const ToastContext = createContext(null);
let idCounter = 0;

const ICONS = { success: Check, error: AlertCircle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, variant = "default", duration = 3000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    show: (msg, duration) => push(msg, "default", duration),
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration),
    info: (msg, duration) => push(msg, "info", duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          const toastClass =
            t.variant === "success" ? "toast toast-success" :
            t.variant === "error" ? "toast toast-error" : "toast";
          return (
            <div key={t.id} className={toastClass} role="status">
              {Icon && <Icon size={16} />}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "inherit", opacity: 0.8 }}
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a <ToastProvider>");
  return context;
}