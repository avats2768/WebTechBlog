/* ==========================================================================
   CodeBlock.jsx

   Place at: src/components/CodeBlock.jsx

   A small, reusable "code snippet + copy button" block.
   Used by ThemeDemo.jsx, but you can reuse it anywhere you want a
   copyable snippet (docs pages, style guides, etc).
   ========================================================================== */

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (e.g. insecure context) — fail silently in UI.
    }
  }

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      <button
        type="button"
        onClick={handleCopy}
        className="btn btn-ghost btn-icon"
        style={{ position: "absolute", top: 8, right: 8 }}
        aria-label="Copy code"
        title="Copy code"
      >
        {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
      </button>

      <pre
        className="body-sm"
        style={{
          margin: 0,
          padding: "16px",
          paddingRight: "44px",
          overflowX: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          color: "var(--text-primary)",
          backgroundColor: "var(--surface)",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}