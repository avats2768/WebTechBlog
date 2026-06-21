/* ==========================================================================
   FormControls.jsx
   Place at: src/components/FormControls.jsx

   Usage:
      <Switch checked={notifs} onChange={setNotifs} label="Email notifications" />
      <Checkbox checked={agree} onChange={setAgree} label="I agree to the terms" />
      <Radio name="plan" value="pro" checked={plan === "pro"} onChange={() => setPlan("pro")} label="Pro" />
   ========================================================================== */

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="switch-row" style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <span
        className={`switch ${checked ? "switch-on" : ""}`}
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="switch-thumb" />
      </span>
      {label && <span className="body-sm" style={{ color: "var(--text-primary)" }}>{label}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className="checkbox-row" style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <input
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span className="body-sm" style={{ color: "var(--text-primary)" }}>{label}</span>}
    </label>
  );
}

export function Radio({ name, value, checked, onChange, label, disabled }) {
  return (
    <label className="checkbox-row" style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <input
        type="radio"
        name={name}
        value={value}
        className="radio-input"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {label && <span className="body-sm" style={{ color: "var(--text-primary)" }}>{label}</span>}
    </label>
  );
}