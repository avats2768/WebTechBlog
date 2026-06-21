/* ==========================================================================
   ConfirmDialog.jsx

   Place at: src/components/ConfirmDialog.jsx

   Pure presentational piece — renders the actual dialog markup.
   You normally won't import this directly; use the useConfirm() hook
   below instead. It's exported separately in case you want a fully
   controlled version somewhere (e.g. inside a form, not triggered
   imperatively).
   ========================================================================== */

import { AlertTriangle, HelpCircle, Info } from "lucide-react";

const ICONS = {
  danger: AlertTriangle,
  info: Info,
  default: HelpCircle,
};

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",   // "default" | "danger" | "info"
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const Icon = ICONS[variant] || ICONS.default;
  const confirmBtnClass = variant === "danger" ? "btn btn-danger" : "btn btn-primary";

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="modal-body" style={{ paddingBottom: 8 }}>
          <div className="flex-center" style={{ justifyContent: "flex-start", gap: 12, marginBottom: 12 }}>
            <div
              className="flex-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                backgroundColor:
                  variant === "danger"
                    ? "color-mix(in srgb, var(--danger) 16%, transparent)"
                    : variant === "info"
                    ? "color-mix(in srgb, var(--info) 16%, transparent)"
                    : "var(--surface)",
                color:
                  variant === "danger"
                    ? "var(--danger)"
                    : variant === "info"
                    ? "var(--info)"
                    : "var(--text-primary)",
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>
            <h3 id="confirm-dialog-title" className="heading-md" style={{ margin: 0 }}>
              {title}
            </h3>
          </div>

          {message && (
            <p className="body-sm" style={{ marginLeft: 52 }}>
              {message}
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={confirmBtnClass} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}