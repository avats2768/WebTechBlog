import { useState } from "react";
import { Phone, PhoneMissed, Video, VideoOff, X, PhoneCall } from "lucide-react";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function CallHistoryAvatar({ src, name }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  return (
    <span
      className="call-history-avatar"
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
  );
}

export default function CallHistoryPanel({ onClose, loading, history, chatUsername }) {
  return (
    <div className="call-history-overlay" role="presentation" onClick={onClose}>
      <div className="call-history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="call-history-header">
          <h3 className="call-history-title">Call History</h3>
          <button className="chat-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="call-history-list">
          {loading && (
            <div className="call-history-empty">
              <PhoneCall size={28} />
              <p>Loading call history…</p>
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className="call-history-empty">
              <PhoneCall size={28} />
              <p>No calls yet with {chatUsername}.</p>
            </div>
          )}

          {!loading &&
            history.map((entry) => {
              const isVideo = entry.callType === "VIDEO";
              const isMissedOrRejected = ["MISSED", "REJECTED"].includes(entry.status);
              const hadNoDuration = !entry.durationSeconds && entry.status !== "ENDED";

              const Icon = isVideo
                ? isMissedOrRejected
                  ? VideoOff
                  : Video
                : isMissedOrRejected
                ? PhoneMissed
                : Phone;

              return (
                <div key={entry.callUuid} className="call-history-item">
                  <CallHistoryAvatar src={entry.profileImage} name={entry.username} />

                  <div className="call-history-info">
                    <div className="call-history-name">{entry.username}</div>
                    <div className="call-history-meta">
                      <span>{entry.incoming ? "Incoming" : "Outgoing"} {isVideo ? "video" : "audio"}</span>
                      <span className="call-history-dot" />
                      <span>{formatTime(entry.endedAt)}</span>
                      {entry.durationSeconds > 0 ? (
                        <>
                          <span className="call-history-dot" />
                          <span>{formatDuration(entry.durationSeconds)}</span>
                        </>
                      ) : entry.status === "ENDED" && hadNoDuration ? (
                        <>
                          <span className="call-history-dot" />
                          <span>No answer</span>
                        </>
                      ) : entry.status && entry.status !== "ENDED" ? (
                        <>
                          <span className="call-history-dot" />
                          <span>{entry.status}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <span className={`call-history-icon ${isMissedOrRejected ? "missed" : ""}`}>
                    <Icon size={15} />
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}