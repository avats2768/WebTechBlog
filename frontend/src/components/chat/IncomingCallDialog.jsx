import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallDialog({ caller, isVideo, onAccept, onDecline }) {
  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-card">
        <div className="incoming-call-avatar-wrap">
          <span className="incoming-call-pulse" />
          <span className="incoming-call-avatar">
            {caller?.profileImage ? (
              <img
                src={caller.profileImage}
                alt={caller?.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (caller?.username || "?").slice(0, 2).toUpperCase()
            )}
          </span>
        </div>
        <p className="incoming-call-name">{caller?.username}</p>
        <p className="incoming-call-subtitle">
          {isVideo ? <Video size={14} /> : <Phone size={14} />}
          Incoming {isVideo ? "video" : "audio"} call
        </p>
        <div className="incoming-call-actions">
          <button className="call-round-btn decline" onClick={onDecline} aria-label="Decline call">
            <PhoneOff size={22} />
          </button>
          <button className="call-round-btn accept" onClick={onAccept} aria-label="Accept call">
            <Phone size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}