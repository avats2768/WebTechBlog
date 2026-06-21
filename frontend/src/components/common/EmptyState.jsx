/* ==========================================================================
   EmptyState.jsx
   Place at: src/components/EmptyState.jsx

   Usage:
      <EmptyState
        icon={Inbox}
        title="No notifications yet"
        description="When something happens, you'll see it here."
        action={<button className="btn btn-primary">Refresh</button>}
      />
   ========================================================================== */

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex-column flex-center" style={{ padding: "48px 24px", textAlign: "center", gap: 6 }}>
      {Icon && (
        <div
          className="flex-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--surface)",
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          <Icon size={26} />
        </div>
      )}
      <h3 className="heading-md">{title}</h3>
      {description && <p className="body-sm" style={{ maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}