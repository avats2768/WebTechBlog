/* ==========================================================================
   ThemedSelect.jsx

   Place at: src/components/ThemedSelect.jsx

   A drop-in replacement for react-select's <Select> that's pre-wired to
   your theme — handles the CSS-variable styles AND the light/dark remount
   key internally, so you never repeat that boilerplate again.

   USAGE — anywhere you currently write:

      import Select from "react-select";
      <Select isMulti options={...} value={...} onChange={...} styles={...} />

   replace with:

      import ThemedSelect from "../../components/ThemedSelect"; // adjust path
      <ThemedSelect isMulti options={...} value={...} onChange={...} />

   Every other react-select prop (isMulti, isClearable, placeholder,
   noOptionsMessage, isDisabled, etc) still works — they just pass through.
   ========================================================================== */

import Select from "react-select";
import { useTheme } from "../../context/ThemeContext"; // adjust path if needed
import { getSelectStyles } from "../../styles/reactSelectTheme"; // adjust path if needed

export default function ThemedSelect({ styles, ...props }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Select
      key={isDark ? "dark" : "light"} // forces a remount so colors re-read on theme toggle
      styles={{ ...getSelectStyles(), ...styles }} // allow per-usage overrides if ever needed
      {...props}
    />
  );
}