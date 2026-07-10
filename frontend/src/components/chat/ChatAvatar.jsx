import { useState } from "react";

export default function ChatAvatar({ src, name, online }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  return (
    <span className="chat-header-avatar-wrap">
      <span
        className="chat-header-avatar"
        style={{
          backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)",
          color: "var(--primary)",
        }}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials
        )}
      </span>
      {online && <span className="chat-online-dot" />}
    </span>
  );
}