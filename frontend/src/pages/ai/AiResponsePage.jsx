/* ==========================================================================
   AIResponsePage.jsx

   Place at: src/pages/AIResponsePage.jsx

   Full-width chat screen (fills the content area next to the sidebar,
   the way "AI Chat Bot" does in the TechSocial layout). Differences from
   the single-card version:

   - Full-width, edge-to-edge — no centered 720px column
   - Multi-turn: every send appends a user message + a new AI reply,
     older turns stay in a scrollable history (like a real chat)
   - The AI reply "streams" in word-by-word after the response comes
     back, with a blinking cursor + a pulsing "Live" badge, so it reads
     as live even though the API call itself isn't token-streamed
   - Input bar is a full-width pill, pinned to the bottom of the screen,
     mirroring the screenshot's "Message Claude…" bar
   ========================================================================== */

import { useState, useRef, useEffect } from "react";
import { Send, Square, Sparkles } from "lucide-react";
import { AiResponse } from "../../components/common/AiResponse";
import { useToast } from "../../context/ToastContext";
import HomeLayout from "../../layouts/HomeLayout";
import { AiPrompt } from "../../api/aiApi";

let idCounter = 0;
const nextId = () => `msg-${++idCounter}-${Date.now()}`;

/* Reveal `fullText` into a message a few words at a time, so the UI reads
   as a live stream instead of a single content update. */
function streamTextIntoMessage(fullText, updateMessage, { onDone } = {}) {
  const words = fullText.split(/(\s+)/); // keep whitespace as its own tokens
  let i = 0;

  const interval = setInterval(() => {
    const chunk = words.slice(i, i + 3).join("");
    i += 3;
    updateMessage((prev) => prev + chunk);

    if (i >= words.length) {
      clearInterval(interval);
      onDone?.();
    }
  }, 35);

  return () => clearInterval(interval);
}

export function AIResponsePage() {
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      role: "ai",
      status: "done",
      model: "Gemini",
      timestamp: "Just now",
      content: "Ask me anything — I'll show my response here.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const textareaRef = useRef(null);
  const scrollRef = useRef(null);
  const stopStreamRef = useRef(null);
  const toast = useToast();

  // Auto-grow the textarea up to a max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  // Keep the latest message in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function patchMessage(id, patch) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m))
    );
  }

  async function runTurn(promptText, aiId) {
    try {
      const res = await AiPrompt(promptText);
      const fullText = res?.data ?? "";

      patchMessage(aiId, { status: "streaming", content: "" });
      stopStreamRef.current?.();
      stopStreamRef.current = streamTextIntoMessage(
        fullText,
        (updater) => patchMessage(aiId, (m) => ({ content: updater(m.content) })),
        { onDone: () => patchMessage(aiId, { status: "done" }) }
      );
    } catch {
      patchMessage(aiId, { status: "error", content: "" });
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    const message = input.trim();
    if (!message || busy) return;

    setInput("");
    setBusy(true);

    const userId = nextId();
    const aiId = nextId();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: message, timestamp: "Just now" },
      { id: aiId, role: "ai", status: "loading", model: "Gemini", timestamp: "Just now", content: "" },
    ]);

    runTurn(message, aiId);
  }

  function handleRegenerate(aiId, precedingUserContent) {
    if (busy) return;
    setBusy(true);
    patchMessage(aiId, { status: "loading", content: "" });
    runTurn(precedingUserContent, aiId);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <HomeLayout>
      <div
        className="bg-background flex-column"
        style={{ height: "100vh", width: "100%" }}
      >
        {/* ---- Scrollable message history, full width ---- */}
        <div
          ref={scrollRef}
          className="flex-column"
          style={{
            flex: 1,
            overflowY: "auto",
            gap: 28,
            padding: "32px 40px 24px",
            width: "100%",
          }}
        >
          {messages.map((m, i) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex-column" style={{ alignItems: "flex-end", width: "100%" }}>
                  <div
                    style={{
                      maxWidth: "70%",
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground, #fff)",
                      borderRadius: "var(--radius-lg, 14px)",
                      padding: "10px 16px",
                      whiteSpace: "pre-wrap",
                    }}
                    className="body-md"
                  >
                    {m.content}
                  </div>
                </div>
              );
            }

            // Find the user message right before this AI reply, for regenerate
            const precedingUser = [...messages.slice(0, i)].reverse().find((x) => x.role === "user");

            return (
              <div key={m.id} style={{ width: "100%" }}>
                <AiResponse
                  status={m.status}
                  content={m.content}
                  model={m.model}
                  timestamp={m.timestamp}
                  onRegenerate={() => handleRegenerate(m.id, precedingUser?.content ?? "")}
                  onCopy={() => toast.success("Copied to clipboard.")}
                  onFeedback={(value) =>
                    toast.info(value === "up" ? "Thanks for the feedback!" : "Noted — thanks.")
                  }
                />
              </div>
            );
          })}
        </div>

        {/* ---- Input bar: full-width pill, pinned to the bottom ---- */}
        <div style={{ width: "100%", padding: "0 40px 24px" }}>
          <div
            className="border-default"
            style={{
              width: "100%",
              borderRadius: 999,
              padding: "6px 8px 6px 20px",
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              backgroundColor: "var(--surface, var(--background))",
              boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.06))",
            }}
          >
            <Sparkles size={16} style={{ opacity: 0.4, marginBottom: 10, flexShrink: 0 }} />
            <textarea
              ref={textareaRef}
              placeholder="Message Gemini…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                maxHeight: 160,
                padding: "10px 0",
                fontFamily: "inherit",
                fontSize: "inherit",
                color: "var(--text-primary)",
              }}
            />
            <button
              className="btn btn-primary btn-icon"
              style={{ borderRadius: "50%", flexShrink: 0 }}
              disabled={busy ? false : !input.trim()}
              onClick={busy ? undefined : handleSend}
              aria-label={busy ? "Generating…" : "Send message"}
            >
              {busy ? <Square size={14} /> : <Send size={16} />}
            </button>
          </div>
          <p className="body-sm" style={{ opacity: 0.5, marginTop: 8, textAlign: "center" }}>
            Press Enter to send, Shift+Enter for a new line.
          </p>
        </div>
      </div>
    </HomeLayout>
  );
}