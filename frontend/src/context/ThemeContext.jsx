/* ==========================================================================
   ThemeContext.jsx

   Place at: src/context/ThemeContext.jsx

   Wrap your whole app with <ThemeProvider> once, in main.jsx:

      import { ThemeProvider } from "./context/ThemeContext";

      <ThemeProvider>
        <App />
      </ThemeProvider>

   Then in any component:

      import { useTheme } from "../context/ThemeContext";
      const { theme, toggleTheme } = useTheme();
   ========================================================================== */

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "app-theme"; // value stored is "light" | "dark"

/** Reads localStorage first, then falls back to the OS-level preference. */
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply the .dark class to <html> and persist the choice whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // If the user never explicitly chose a theme, keep following the OS setting.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemChange(event) {
      const hasManualChoice = localStorage.getItem(STORAGE_KEY);
      if (!hasManualChoice) {
        setTheme(event.matches ? "dark" : "light");
      }
    }

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function setLightTheme() {
    setTheme("light");
  }

  function setDarkTheme() {
    setTheme("dark");
  }

  const value = { theme, toggleTheme, setLightTheme, setDarkTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access the current theme and the functions to change it. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }
  return context;
}