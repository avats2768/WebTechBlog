import { createContext, useCallback, useContext, useState } from "react";
import { Check, X, Info, AlertCircle, MessageCircle } from "lucide-react";

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
    setToasts((prev) => [...prev, { id, kind: "simple", message, variant }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const notify = useCallback(({ title, body, avatar, onClick, duration = 5000 }) => {
    const id = ++idCounter;
    setToasts((prev) => [
      ...prev,
      { id, kind: "message", title, body, avatar, onClick },
    ]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    show: (msg, duration) => push(msg, "default", duration),
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration),
    info: (msg, duration) => push(msg, "info", duration),
    notify,
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
          maxWidth: 340,
        }}
      >
        {toasts.map((t) => {
          if (t.kind === "message") {
            return (
              <div
                key={t.id}
                className="toast"
                role="status"
                onClick={() => {
                  t.onClick?.();
                  dismiss(t.id);
                }}
                style={{
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: t.onClick ? "pointer" : "default",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)",
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <MessageCircle size={15} />
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                    {t.title}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12.5,
                      opacity: 0.85,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.body}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(t.id);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "inherit", opacity: 0.7 }}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

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