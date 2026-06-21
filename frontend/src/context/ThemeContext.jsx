import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "app-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

// Applies the .dark class + persists to localStorage immediately,
// synchronously, so any component reading CSS variables on the very
// next render (e.g. react-select via getComputedStyle) already sees
// the correct values — no waiting for a useEffect to catch up.
function applyTheme(nextTheme) {
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  localStorage.setItem(STORAGE_KEY, nextTheme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply on initial mount too (covers the very first render, before
  // any manual toggle has happened).
  useEffect(() => {
    applyTheme(theme);
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
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next); // synchronous — happens before the re-render that follows
      return next;
    });
  }

  function setLightTheme() {
    applyTheme("light");
    setTheme("light");
  }

  function setDarkTheme() {
    applyTheme("dark");
    setTheme("dark");
  }

  const value = { theme, toggleTheme, setLightTheme, setDarkTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }
  return context;
}