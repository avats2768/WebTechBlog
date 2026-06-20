import { CheckCircle2 } from "lucide-react";
import Logo from "../assets/logo/app-logo.svg"; // adjust path if needed
import { ThemeToggle } from "../components/ThemeToggle"; // adjust path if needed

const HIGHLIGHTS = [
  "Real-time discussions with other developers",
  "Long-form technical writing, all in one place",
  "Built for builders, not for algorithms",
];

// Mock platform stats shown in the header — swap these for real data
// (e.g. from an API call or Redux) whenever you have it wired up.
const STATS = [
  { label: "Developers", value: "12.4k" },
  { label: "Posts today", value: "340" },
];

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Help", href: "/help" },
];

/**
 * AuthLayout
 * Shared shell for Login / Register:
 *  - a slim top header (logo, live stats, theme toggle) — always visible
 *  - a brand panel on the left (hidden below `lg`)
 *  - a themed card on the right holding the form itself
 *  - a slim footer (copyright + legal links) — always visible
 *
 * Header and footer use a flex column on the root element (rather than
 * fixed pixel-height math) so the middle section always fills whatever
 * space is left, on any screen size.
 *
 * Uses theme.css surfaces/text/border so it adapts with light/dark mode,
 * plus Tailwind's own layout utilities (grid, hidden, lg:flex, w-full) —
 * theme.css adds component classes on top of Tailwind, it doesn't replace it.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Top header — logo, stats, theme toggle */}
      <header
        className="flex-between"
        style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex-center" style={{ justifyContent: "flex-start", gap: 10 }}>
          <img src={Logo} alt="ConnectX logo" className="w-8 h-8" />
          <span className="heading-md">ConnectX</span>
        </div>

        <div className="hidden md:flex" style={{ gap: 28 }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="flex-column" style={{ alignItems: "center", lineHeight: 1.2 }}>
              <span className="heading-md" style={{ fontSize: "0.95rem" }}>{stat.value}</span>
              <span className="body-sm" style={{ fontSize: "0.7rem" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <ThemeToggle />
      </header>

      {/* Main split: brand panel + form card — fills all remaining space */}
      <div className="grid lg:grid-cols-2" style={{ flex: 1 }}>
        {/* Brand panel */}
        <div
          className="hidden lg:flex flex-column"
          style={{
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border)",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <div className="flex-column" style={{ gap: 32, maxWidth: 440 }}>
            <div>
              <h2 className="heading-xl">Build, ship, and talk shop.</h2>
              <p className="body-lg" style={{ marginTop: 12, color: "var(--text-secondary)" }}>
                Join developers sharing what they're building, asking real questions,
                and growing together.
              </p>
            </div>

            <ul className="flex-column" style={{ gap: 12, listStyle: "none", padding: 0 }}>
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex-center" style={{ justifyContent: "flex-start", gap: 10 }}>
                  <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span className="body-md">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-center" style={{ padding: 24 }}>
          <div className="card p-lg" style={{ width: "100%", maxWidth: 420 }}>
            <h1 className="heading-xl" style={{ marginBottom: 4 }}>{title}</h1>
            {subtitle && <p className="body-md" style={{ marginBottom: 24 }}>{subtitle}</p>}

            {children}

            {footer && <div style={{ marginTop: 24, textAlign: "center" }}>{footer}</div>}
          </div>
        </div>
      </div>

      {/* Bottom footer — copyright + legal links, always visible */}
      <footer
        className="flex-between"
        style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}
      >
        <p className="body-sm">© {year} ConnectX. All rights reserved.</p>

        <div className="flex-center" style={{ gap: 20 }}>
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="body-sm" style={{ color: "var(--text-secondary)" }}>
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

/**
 * AuthField
 * Themed input with an optional left icon and inline error text.
 * Reused by both Login and Register so the two forms stay identical
 * in spacing and behavior.
 */
export function AuthField({ icon: Icon, label, error, ...inputProps }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              pointerEvents: "none",
            }}
          />
        )}
        <input
          {...inputProps}
          className={`input ${error ? "input-error" : ""}`}
          style={Icon ? { paddingLeft: 36 } : undefined}
        />
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
}