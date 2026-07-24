import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Video,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  History,
} from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { getMyCallHistory } from "../../api/callApi";
import { createPrivateChat } from "../../api/chatApi";
import { useToast } from "../../context/ToastContext";

// --- Field extraction, matched to the actual /call/history response ---
// {
//   callType: "VIDEO" | "AUDIO",
//   callUuid, durationSeconds, endedAt,
//   incoming: boolean,
//   profileImage, roomUuid, status, userUuid, username
// }

function getCallType(entry) {
  return entry.callType === "VIDEO" ? "video-call" : "audio-call";
}

function getDirection(entry) {
  return entry.incoming ? "INCOMING" : "OUTGOING";
}

const MISSED_STATUSES = ["MISSED", "DECLINED", "NO_ANSWER", "REJECTED", "CANCELLED"];

function isMissedCall(entry) {
  return MISSED_STATUSES.includes((entry.status || "").toUpperCase());
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function CallHistoryPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingUuid, setCallingUuid] = useState(null); // userUuid currently being re-called

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const data = await getMyCallHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load call history", error);
      toast.error("Could not load call history");
    } finally {
      setLoading(false);
    }
  }

  async function handleCallAgain(entry) {
    const callType = getCallType(entry);

    if (!entry.userUuid) {
      toast.error("Could not start the call. Missing user info.");
      return;
    }

    if (callingUuid) return; // avoid double-taps

    setCallingUuid(entry.userUuid);
    try {
      const room = await createPrivateChat(entry.userUuid);
      navigate("/chat", { state: { ...room, autoStartCall: callType } });
    } catch (error) {
      console.error(error);
      toast.error("Could not start the call. Please try again.");
    } finally {
      setCallingUuid(null);
    }
  }

  function openChat(entry) {
    if (!entry.roomUuid || !entry.userUuid) return;

    navigate("/chat", {
      state: {
        roomUuid: entry.roomUuid,
        userUuid: entry.userUuid,
        username: entry.username,
        profileImage: entry.profileImage,
      },
    });
  }

  return (
    <HomeLayout>
      <style>{`
        .call-history-page-wrap {
          margin: 20px auto;
        }

        .call-history-page-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .call-history-page-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background-color: var(--background);
          overflow: hidden;
        }

        .chp-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .chp-item:last-child {
          border-bottom: none;
        }
        .chp-item:hover {
          background-color: var(--surface);
        }

        .chp-avatar {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 600;
          overflow: hidden;
          background-color: color-mix(in srgb, var(--primary) 14%, transparent);
          color: var(--primary);
        }
        .chp-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chp-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .chp-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chp-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }
        .chp-meta.missed {
          color: var(--danger, #dc2626);
        }

        .chp-dot {
          width: 3px;
          height: 3px;
          min-width: 3px;
          border-radius: 50%;
          background-color: currentColor;
          opacity: 0.5;
        }

        .chp-call-again-btn {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: color-mix(in srgb, var(--success) 14%, transparent);
          color: var(--success);
          transition: background-color 0.15s ease, transform 0.1s ease;
        }
        .chp-call-again-btn:hover {
          background-color: color-mix(in srgb, var(--success) 24%, transparent);
        }
        .chp-call-again-btn:active {
          transform: scale(0.94);
        }
        .chp-call-again-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chp-empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .chp-empty-state svg {
          opacity: 0.4;
        }
      `}</style>

      <div className="call-history-page-wrap">
        <div className="call-history-page-header">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="heading-lg" style={{ margin: 0 }}>
            Call History
          </h1>
        </div>

        <div className="call-history-page-card">
          {loading ? (
            <p className="body-sm" style={{ padding: 18 }}>
              Loading call history…
            </p>
          ) : history.length === 0 ? (
            <div className="chp-empty-state">
              <History size={36} />
              <p className="body-sm">You haven't made any calls yet.</p>
            </div>
          ) : (
            history.map((entry) => {
              const callType = getCallType(entry);
              const direction = getDirection(entry);
              const missed = isMissedCall(entry);
              const isVideo = callType === "video-call";
              const durationLabel = formatDuration(entry.durationSeconds);
              const isCallingThis = callingUuid === entry.userUuid;

              const DirectionIcon = missed
                ? PhoneMissed
                : direction === "OUTGOING"
                ? PhoneOutgoing
                : PhoneIncoming;

              return (
                <div
                  key={entry.callUuid}
                  className="chp-item"
                  onClick={() => openChat(entry)}
                >
                  <div className="chp-avatar">
                    {entry.profileImage ? (
                      <img src={entry.profileImage} alt={entry.username} />
                    ) : (
                      initials(entry.username)
                    )}
                  </div>

                  <div className="chp-info">
                    <span className="chp-name">
                      {entry.username || "Unknown user"}
                    </span>
                    <span className={`chp-meta ${missed ? "missed" : ""}`}>
                      <DirectionIcon size={13} />
                      {isVideo ? "Video" : "Audio"}
                      <span className="chp-dot" />
                      {missed
                        ? "Missed"
                        : direction === "OUTGOING"
                        ? "Outgoing"
                        : "Incoming"}
                      {durationLabel && (
                        <>
                          <span className="chp-dot" />
                          {durationLabel}
                        </>
                      )}
                      <span className="chp-dot" />
                      {formatDateTime(entry.endedAt)}
                    </span>
                  </div>

                  <button
                    className="chp-call-again-btn"
                    disabled={isCallingThis || !entry.userUuid}
                    onClick={(e) => {
                      e.stopPropagation(); // don't also trigger openChat
                      handleCallAgain(entry);
                    }}
                    aria-label={`Call ${entry.username} again`}
                    title="Call again"
                  >
                    {isVideo ? <Video size={16} /> : <Phone size={16} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </HomeLayout>
  );
}