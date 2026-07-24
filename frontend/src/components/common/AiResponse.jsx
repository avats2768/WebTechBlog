/* ==========================================================================
   AiResponse.jsx

   Place at: src/components/common/AiResponse.jsx

   Renders a single AI response, full width, with:
   - Basic markdown rendering (### headings, **bold**, *italic*, bullet
     lists, blank-line paragraphs) so raw "###" / "**" never shows on screen
   - A "streaming" status that reveals text word-by-word with a blinking
     cursor, so it visually feels live while the answer is coming in
   - "loading" (typing dots), "streaming", "done", and "error" states
   - Action row: copy / regenerate / thumbs up / thumbs down

   Usage:
     <AiResponse
       status="streaming"        // "loading" | "streaming" | "done" | "error"
       content={partialOrFullText}
       model="Gemini"
       timestamp="Just now"
       onRegenerate={...}
       onCopy={...}
       onFeedback={(v) => {}}    // v: "up" | "down"
     />
   ========================================================================== */

import { useState, Fragment } from "react";
import {
  Sparkles,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  AlertCircle,
} from "lucide-react";
import { Tooltip } from "./Tooltip";

/* -------------------------------------------------------------------- */
/*  Minimal markdown renderer — headings, bold/italic, bullet lists,     */
/*  paragraphs. Enough to make model output readable without pulling    */
/*  in a full markdown library.                                         */
/* -------------------------------------------------------------------- */

function renderInline(text, keyPrefix) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={`${keyPrefix}-${i}`}>{token.slice(1, -1)}</em>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{token}</Fragment>;
  });
}

function renderMarkdown(content) {
  const blocks = content.split(/\n\s*\n/);

  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) return null;

    // Heading
    const headingMatch = lines[0].match(/^(#{1,3})\s+(.*)/);
    if (headingMatch && lines.length === 1) {
      const level = headingMatch[1].length;
      const Tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
      return (
        <Tag
          key={bi}
          className={level === 1 ? "heading-md" : "heading-sm"}
          style={{ marginTop: bi === 0 ? 0 : 20, marginBottom: 8 }}
        >
          {renderInline(headingMatch[2], `h-${bi}`)}
        </Tag>
      );
    }

    // Bullet list
    const isList = lines.every((l) => /^[*-]\s+/.test(l.trim()));
    if (isList) {
      return (
        <ul
          key={bi}
          style={{ margin: "8px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}
        >
          {lines.map((l, li) => (
            <li key={li} className="body-md">
              {renderInline(l.trim().replace(/^[*-]\s+/, ""), `li-${bi}-${li}`)}
            </li>
          ))}
        </ul>
      );
    }

    // Paragraph
    return (
      <p key={bi} className="body-md" style={{ margin: bi === 0 ? 0 : "12px 0 0" }}>
        {lines.map((l, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(l, `p-${bi}-${li}`)}
          </Fragment>
        ))}
      </p>
    );
  });
}

/* Typing indicator: three dots pulsing in sequence */
function TypingDots() {
  return (
    <span className="flex-center" style={{ gap: 4, height: 20 }} aria-label="AI is responding">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "var(--text-tertiary, var(--text-secondary))",
            display: "inline-block",
            animation: `ai-typing-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes ai-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes ai-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export function AiResponse({
  status = "done", // "loading" | "streaming" | "done" | "error"
  content = "",
  model = "AI",
  timestamp,
  onRegenerate,
  onCopy,
  onFeedback,
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleCopy() {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  }

  function handleFeedback(value) {
    setFeedback((prev) => (prev === value ? null : value));
    onFeedback?.(value);
  }

  const isLive = status === "loading" || status === "streaming";

  return (
    <div className="flex-column" style={{ gap: 10, width: "100%" }}>
      {/* ---- Header: avatar + model name + timestamp ---- */}
      <div className="flex-center" style={{ gap: 10, justifyContent: "flex-start" }}>
        <div
          className="flex-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground, #fff)",
            flexShrink: 0,
          }}
        >
          <Sparkles size={15} />
        </div>
        <span className="body-md" style={{ fontWeight: 600 }}>
          {model}
        </span>
        {timestamp && (
          <span className="body-sm" style={{ opacity: 0.55 }}>
            {timestamp}
          </span>
        )}
        {isLive && (
          <span
            className="badge"
            style={{
              backgroundColor: "var(--success-bg, rgba(34,197,94,0.12))",
              color: "var(--success, #16a34a)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "currentColor",
                animation: "ai-typing-bounce 1s infinite",
              }}
            />
            {status === "loading" ? "Thinking" : "Live"}
          </span>
        )}
      </div>

      {/* ---- Body: full width, no artificial max-width ---- */}
      <div
        className="border-default"
        style={{
          width: "100%",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
          backgroundColor: "var(--surface, var(--background))",
        }}
      >
        {status === "loading" && <TypingDots />}

        {status === "error" && (
          <div className="alert alert-danger flex-between">
            <span className="flex-center" style={{ gap: 8 }}>
              <AlertCircle size={16} />
              Something went wrong generating this response.
            </span>
            <button className="btn btn-outline" onClick={onRegenerate}>
              <RotateCcw size={14} /> Retry
            </button>
          </div>
        )}

        {(status === "done" || status === "streaming") && (
          <div>
            {renderMarkdown(content)}
            {status === "streaming" && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  verticalAlign: "text-bottom",
                  backgroundColor: "var(--text-primary, currentColor)",
                  marginLeft: 2,
                  animation: "ai-cursor-blink 1s step-start infinite",
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ---- Actions (once there's settled content) ---- */}
      {status === "done" && (
        <div className="flex-center" style={{ gap: 4, justifyContent: "flex-start" }}>
          <Tooltip content={copied ? "Copied" : "Copy"} side="bottom">
            <button className="btn btn-ghost btn-icon" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </Tooltip>
          <Tooltip content="Regenerate" side="bottom">
            <button className="btn btn-ghost btn-icon" onClick={onRegenerate}>
              <RotateCcw size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Good response" side="bottom">
            <button
              className={`btn btn-ghost btn-icon ${feedback === "up" ? "text-success" : ""}`}
              onClick={() => handleFeedback("up")}
            >
              <ThumbsUp size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Bad response" side="bottom">
            <button
              className={`btn btn-ghost btn-icon ${feedback === "down" ? "text-danger" : ""}`}
              onClick={() => handleFeedback("down")}
            >
              <ThumbsDown size={14} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}