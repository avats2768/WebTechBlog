/* ==========================================================================
   ThemeToggle.jsx

   Place at: src/components/ThemeToggle.jsx

   A ready-to-use light/dark toggle button. Drop it in your navbar:

      import { ThemeToggle } from "./components/ThemeToggle";
      <ThemeToggle />
   ========================================================================== */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-outline btn-icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}