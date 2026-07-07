import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Spinner } from "../common/Loader";
import { useToast } from "../../context/ToastContext";
import { updatePassword } from "../../api/authApi";

const initialForm = { oldPassword: "", newPassword: "", confirmPassword: "" };

function PasswordField({ label, value, onChange, error, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className={`input ${error ? "input-error" : ""}`}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ paddingRight: 40, width: "100%" }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            color: "var(--text-secondary)",
          }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function updateField(key) {
    return (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function handleClose() {
    if (submitting) return;
    setForm(initialForm);
    setErrors({});
    onClose();
  }

  function validate() {
    const next = {};
    if (!form.oldPassword) next.oldPassword = "Enter your current password.";

    if (!form.newPassword) {
      next.newPassword = "Enter a new password.";
    } else if (form.newPassword.length < 8) {
      next.newPassword = "Must be at least 8 characters.";
    } else if (form.oldPassword && form.newPassword === form.oldPassword) {
      next.newPassword = "New password must be different from the current one.";
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Confirm your new password.";
    } else if (form.confirmPassword !== form.newPassword) {
      next.confirmPassword = "Passwords don't match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await updatePassword(form.oldPassword, form.newPassword);
      toast.success("Password updated.");
      setForm(initialForm);
      onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to update password. Check your current password and try again.";
      setErrors({ oldPassword: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          Change password
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleClose}
            type="button"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <PasswordField
              label="Current password"
              placeholder="Enter your current password"
              value={form.oldPassword}
              onChange={updateField("oldPassword")}
              error={errors.oldPassword}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              placeholder="At least 8 characters"
              value={form.newPassword}
              onChange={updateField("newPassword")}
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter your new password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <Spinner size={16} /> : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}