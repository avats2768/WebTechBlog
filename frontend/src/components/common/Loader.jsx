/* ==========================================================================
   Loaders.jsx
   Place at: src/components/Loaders.jsx

   Usage:
      <Spinner />                          // inline spinner, default size
      <Spinner size={24} />
      <button className="btn btn-primary" disabled={loading}>
        {loading ? <Spinner size={16} /> : "Save"}
      </button>

      <Skeleton width="100%" height={20} />
      <Skeleton width={120} height={120} circle />
   ========================================================================== */

export function Spinner({ size = 18 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ width = "100%", height = 16, circle = false }) {
  return (
    <span
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : "var(--radius-sm)",
        display: "block",
      }}
    />
  );
}