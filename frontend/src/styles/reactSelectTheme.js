/* ==========================================================================
   reactSelectTheme.js

   Place at: src/styles/reactSelectTheme.js

   react-select doesn't take className theming — it uses inline JS styles —
   so it can't live in theme.css like everything else. This file is the
   single source of truth instead: define the look once here, import it
   wherever you use <Select>.

   USAGE (in any file using react-select):

      import Select from "react-select";
      import { getSelectStyles } from "../../styles/reactSelectTheme"; // adjust path

      <Select
        key={getSelectStyles.themeKey()}   // forces remount when theme flips
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        styles={getSelectStyles()}
        placeholder="Search and select..."
      />

   Simpler option: use the <ThemedSelect> wrapper component instead
   (src/components/ThemedSelect.jsx) — it calls all of this for you and
   you never have to think about it again.
   ========================================================================== */

/** Reads a CSS variable's current value off <html>, with a fallback. */
function cssVar(name, fallback) {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
}

/**
 * Returns a fresh react-select `styles` object built from the current
 * theme's CSS variables. Call this at render time (not as a constant)
 * so it re-reads the variables whenever it's called.
 */
export function getSelectStyles() {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      borderRadius: cssVar("--radius-md", "10px"),
      backgroundColor: cssVar("--card", "#fff"),
      borderColor: state.isFocused
        ? cssVar("--primary", "#2563eb")
        : cssVar("--border", "#e2e8f0"),
      boxShadow: state.isFocused
        ? `0 0 0 1px ${cssVar("--primary", "#2563eb")}`
        : "none",
      "&:hover": { borderColor: cssVar("--primary", "#2563eb") },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: cssVar("--card", "#fff"),
      border: `1px solid ${cssVar("--border", "#e2e8f0")}`,
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? cssVar("--surface", "#f1f5f9")
        : "transparent",
      color: cssVar("--text-primary", "#0f172a"),
      cursor: "pointer",
    }),
    input: (base) => ({ ...base, color: cssVar("--text-primary", "#0f172a") }),
    placeholder: (base) => ({
      ...base,
      color: cssVar("--text-secondary", "#475569"),
    }),
    singleValue: (base) => ({
      ...base,
      color: cssVar("--text-primary", "#0f172a"),
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: cssVar("--surface", "#f8fafc"),
      borderRadius: "9999px",
      paddingLeft: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: cssVar("--primary", "#2563eb"),
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: cssVar("--primary", "#2563eb"),
      borderRadius: "9999px",
      "&:hover": {
        backgroundColor: cssVar("--border", "#e2e8f0"),
        color: cssVar("--primary-hover", "#1d4ed8"),
      },
    }),
  };
}