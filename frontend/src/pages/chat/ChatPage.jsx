import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Trash2,
  History,
} from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { useSelector } from "react-redux";

import { onChatMessage, sendMessage } from "../../socket/chatSocket";
import { getChatHistory, markMessageAsRead, clearChat } from "../../api/chatApi";
import { getRoomCallHistory } from "../../api/callApi";
import { useConfirm } from "../../context/ConfirmContext";

import useCall from "../../hooks/useCall";
import ChatAvatar from "../../components/chat/ChatAvatar";
import IncomingCallDialog from "../../components/chat/IncomingCallDialog";
import ActiveCallOverlay from "../../components/chat/ActiveCallOverlay";
import CallHistoryPanel from "../../components/chat/CallHistoryPanel";

function getSenderId(msg) {
  return (
    msg.senderId ??
    msg.senderUuid ??
    msg.sender_id ??
    msg.sender?.id ??
    msg.sender?.uuid ??
    null
  );
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { state: chat } = useLocation();
  const [chatInfo, setChatInfo] = useState(chat);

  const currentUserId = useSelector((state) => state.auth.user?.userId);
  const authToken = useSelector((state) => state.auth.token);

  const confirm = useConfirm();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [loadingCallHistory, setLoadingCallHistory] = useState(false);

  const call = useCall({ chat, chatInfo, authToken, currentUserId });

  useEffect(() => {
    if (!chat) {
      navigate("/chats");
      return;
    }

    loadHistory();
    window.addEventListener("chat-status", handleStatus);

    const unsubscribe = onChatMessage((newMessage) => {
      if (newMessage.roomUuid === chat.roomUuid) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      window.removeEventListener("chat-status", handleStatus);
      unsubscribe();
      // No disconnectChatSocket() here — the connection is shared and
      // owned by HomeLayout, not by this page.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // If we arrived here from a "Call" button elsewhere (e.g. the public
  // profile page), start the call automatically — the user already
  // expressed intent by clicking Call, so we skip the confirm dialog.
  // Guarded by a ref so it only fires once, even if this effect re-runs.
  const autoCallTriggeredRef = useRef(false);
  useEffect(() => {
    if (chat?.autoStartCall && !autoCallTriggeredRef.current) {
      autoCallTriggeredRef.current = true;
      call.startCall(chat.autoStartCall);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);     

  const handleStatus = (event) => {
    const status = event.detail;
    if (status.userUuid === chat.userUuid) {
      setChatInfo((prev) => ({ ...prev, online: status.online }));
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getChatHistory(chat.roomUuid);
      setMessages(data);
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        await markMessageAsRead(chat.roomUuid, lastMessage.uuid);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage({
      receiverUuid: chat.userUuid,
      senderId: currentUserId,
      roomUuid: chat.roomUuid,
      message,
      messageType: "TEXT",
    });
    setMessage("");
  };

  const requestCall = async (type) => {
    const isVideo = type === "video-call";
    const ok = await confirm({
      title: isVideo ? "Start video call?" : "Start audio call?",
      message: `You're about to start a${isVideo ? " video" : "n audio"} call with ${chatInfo.username}.`,
      confirmLabel: "Call",
      variant: "info",
    });
    if (ok) call.startCall(type);
  };

  const requestClearChat = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: "Clear this chat?",
      message:
        "This will remove all messages from your view. This action cannot be undone.",
      confirmLabel: "Clear Chat",
      variant: "danger",
    });
    if (ok) {

    await handleClearChat();

}
  };

  const handleClearChat = async () => {

  try {

    await clearChat(chat.roomUuid);

    // setMessages([]);

    // Optional
    await loadHistory();

  } catch (error) {

    console.error(error);

  }

};

  const openCallHistory = async () => {
    setMenuOpen(false);
    setShowCallHistory(true);
    setLoadingCallHistory(true);
    try {
      const data = await getRoomCallHistory(chat.roomUuid);
      setCallHistory(data || []);
    } catch (err) {
      console.error("Could not load call history", err);
      setCallHistory([]);
    } finally {
      setLoadingCallHistory(false);
    }
  };

  if (!chat) return null;

  return (
    <HomeLayout>
      <style>{`
        .chat-page-wrap {
          margin: 20px auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          height: 85vh;
          background-color: var(--background);
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-bottom: 1px solid var(--border);
          background-color: var(--background);
        }

        .chat-header-avatar-wrap {
          position: relative;
          display: inline-flex;
          min-width: 42px;
        }

        .chat-header-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          overflow: hidden;
        }

        .chat-online-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--success);
          border: 2px solid var(--background);
        }

        .chat-back-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-md);
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .chat-back-btn:hover {
          background-color: var(--surface);
          color: var(--text-primary);
        }

        .chat-status-text {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .chat-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          position: relative;
        }

        .chat-icon-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .chat-icon-btn:hover {
          background-color: var(--surface);
          color: var(--primary);
        }
        .chat-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .chat-menu-wrap {
          position: relative;
        }

        .chat-menu-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 180px;
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          padding: 6px;
          z-index: 20;
        }

        .chat-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 13.5px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
        }
        .chat-menu-item:hover {
          background-color: var(--surface);
        }
        .chat-menu-item.danger {
          color: var(--danger, #dc2626);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 18px 15px;
          background-color: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-empty-state {
          margin: auto;
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .chat-empty-state svg {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .chat-bubble-row {
          display: flex;
          width: 100%;
        }
        .chat-bubble-row.mine {
          justify-content: flex-end;
        }
        .chat-bubble-row.theirs {
          justify-content: flex-start;
        }

        .chat-bubble-group {
          display: flex;
          flex-direction: column;
          max-width: 70%;
          min-width: 0;
        }
        .chat-bubble-group.mine {
          align-items: flex-end;
        }
        .chat-bubble-group.theirs {
          align-items: flex-start;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          width: fit-content;
          max-width: 100%;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }
        .chat-bubble.mine {
          background-color: var(--primary);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.theirs {
          background-color: var(--background);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }

        .chat-bubble-time {
          font-size: 11px;
          margin-top: 4px;
          color: var(--text-secondary);
        }

        .chat-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid var(--border);
          background-color: var(--background);
        }

        .chat-input-row input {
          flex: 1;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background-color: var(--surface);
          color: var(--text-primary);
          outline: none;
          font-size: 14px;
          transition: border-color 0.15s ease;
        }
        .chat-input-row input::placeholder {
          color: var(--text-secondary);
        }
        .chat-input-row input:focus {
          border-color: var(--primary);
        }

        .chat-send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* ---- Incoming call dialog ---- */
        .incoming-call-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 15, 20, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 16px;
        }

        .incoming-call-card {
          width: 100%;
          max-width: 320px;
          background-color: var(--background);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          padding: 30px 20px 24px;
          text-align: center;
        }

        .incoming-call-avatar-wrap {
          position: relative;
          width: 84px;
          height: 84px;
          margin: 0 auto 16px;
        }

        .incoming-call-avatar {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 600;
          background-color: color-mix(in srgb, var(--primary) 14%, transparent);
          color: var(--primary);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .incoming-call-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: var(--primary);
          opacity: 0.25;
          animation: incoming-pulse 1.6s ease-out infinite;
        }

        @keyframes incoming-pulse {
          0% { transform: scale(1); opacity: 0.35; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .incoming-call-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
        }

        .incoming-call-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .incoming-call-actions {
          display: flex;
          justify-content: center;
          gap: 22px;
        }

        .call-round-btn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.15s ease, transform 0.1s ease;
        }
        .call-round-btn:active {
          transform: scale(0.94);
        }
        .call-round-btn.accept {
          background-color: var(--success);
          color: #fff;
        }
        .call-round-btn.decline {
          background-color: var(--danger, #dc2626);
          color: #fff;
        }
        .call-round-btn:hover {
          filter: brightness(0.95);
        }

        /* ---- Active call overlay ---- */
        .active-call-overlay {
          position: fixed;
          inset: 0;
          background-color: #0d0f14;
          z-index: 200;
          display: flex;
          flex-direction: column;
        }

        .active-call-remote-video,
        .active-call-local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .active-call-video-stage {
          flex: 1;
          position: relative;
          background-color: #0d0f14;
        }

        .active-call-local-pip {
          position: absolute;
          bottom: 90px;
          right: 20px;
          width: 110px;
          height: 150px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.15);
          background-color: #1a1c22;
        }

        .active-call-audio-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 14px;
        }

        .active-call-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 600;
          background-color: color-mix(in srgb, var(--primary) 30%, transparent);
          overflow: hidden;
        }

        .active-call-name {
          font-size: 18px;
          font-weight: 600;
        }

        .active-call-status {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.65);
        }

        .active-call-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 22px;
        }

        .call-control-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.12);
          color: #fff;
          transition: background-color 0.15s ease, transform 0.1s ease;
        }
        .call-control-btn:active {
          transform: scale(0.94);
        }
        .call-control-btn.off {
          background-color: rgba(255, 255, 255, 0.28);
        }
        .call-control-btn.hangup {
          background-color: var(--danger, #dc2626);
        }

        /* ---- Call history panel ---- */
        /* ---- Call history panel ---- */
.call-history-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 15, 20, 0.4);
  display: flex;
  justify-content: flex-end;
  z-index: 90;
}

.call-history-panel {
  width: 100%;
  max-width: 340px;
  height: 100%;
  background-color: var(--background);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.call-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.call-history-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.call-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
}

.call-history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border-bottom: 1px solid var(--border);
}
.call-history-item:last-child {
  border-bottom: none;
}
.call-history-item:hover {
  background-color: var(--surface);
}

.call-history-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}

.call-history-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.call-history-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.call-history-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
}
.call-history-meta span:not(.call-history-dot) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.call-history-dot {
  width: 3px;
  height: 3px;
  min-width: 3px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  opacity: 0.6;
  flex-shrink: 0;
}

.call-history-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
}
.call-history-icon.missed {
  background-color: color-mix(in srgb, var(--danger, #dc2626) 14%, transparent);
  color: var(--danger, #dc2626);
}

.call-history-empty {
  margin: auto;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.call-history-empty svg {
  opacity: 0.4;
}
.call-history-empty p {
  margin: 0;
  font-size: 13.5px;
}
      `}</style>

      <div className="chat-page-wrap">
        <div className="chat-header">
          <button
            className="chat-back-btn"
            onClick={() => navigate("/messages")}
            aria-label="Back to chats"
          >
            <ArrowLeft size={18} />
          </button>

          <div 
          className="flex gap-2 cursor-pointer"
          onClick={() => navigate(`/public-profile/${chatInfo.userUuid}`)}>

          <ChatAvatar
            src={chatInfo.profileImage}
            name={chatInfo.username}
            online={chatInfo.online}
          />

          <div>
            <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>
              {chatInfo.username}
            </strong>
            <div
              className="chat-status-text"
              style={{
                color: chatInfo.online
                  ? "var(--success)"
                  : "var(--text-secondary)",
              }}
            >
              {chatInfo.online ? "Online" : "Offline"}
            </div>
          </div>
          </div>

          <div className="chat-header-actions">
            <button
              className="chat-icon-btn"
              onClick={() => requestCall("audio-call")}
              aria-label="Start audio call"
              title="Audio call"
              disabled={call.callState.status !== "idle"}
            >
              <Phone size={18} />
            </button>

            <button
              className="chat-icon-btn"
              onClick={() => requestCall("video-call")}
              aria-label="Start video call"
              title="Video call"
              disabled={call.callState.status !== "idle"}
            >
              <Video size={18} />
            </button>

            <div className="chat-menu-wrap" ref={menuRef}>
              <button
                className="chat-icon-btn"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <div className="chat-menu-dropdown" role="menu">
                  <button
                    className="chat-menu-item"
                    role="menuitem"
                    onClick={openCallHistory}
                  >
                    <History size={15} />
                    Call History
                  </button>
                  <button
                    className="chat-menu-item danger"
                    role="menuitem"
                    onClick={requestClearChat}
                  >
                    <Trash2 size={15} />
                    Clear Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="chat-messages">
          {!loadingHistory && messages.length === 0 && (
            <div className="chat-empty-state">
              <MessageCircle size={32} />
              <p className="body-sm">No messages yet. Say hello 👋</p>
            </div>
          )}

          {messages.map((msg) => {
            const senderId = getSenderId(msg);
            const isMine =
              senderId != null &&
              currentUserId != null &&
              Number(senderId) === Number(currentUserId);
            const side = isMine ? "mine" : "theirs";

            return (
              <div key={msg.uuid} className={`chat-bubble-row ${side}`}>
                <div className={`chat-bubble-group ${side}`}>
                  <div className={`chat-bubble ${side}`}>{msg.message}</div>
                  {msg.createdAt && (
                    <span className="chat-bubble-time">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-input-row">
          <input
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="btn btn-primary chat-send-btn"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <Send size={15} />
            Send
          </button>
        </div>
      </div>

      {call.callState.status === "incoming" && (
        <IncomingCallDialog
          caller={call.callState.caller}
          isVideo={call.callState.isVideo}
          onAccept={call.acceptIncomingCall}
          onDecline={call.declineIncomingCall}
        />
      )}

      {(call.callState.status === "calling" ||
        call.callState.status === "connected") && (
          <ActiveCallOverlay
            callState={call.callState}
            chatInfo={chatInfo}
            micEnabled={call.micEnabled}
            camEnabled={call.camEnabled}
            callDuration={call.callDuration}
            localVideoRef={call.localVideoRef}
            remoteVideoRef={call.remoteVideoRef}
            onToggleMic={call.toggleMic}
            onToggleCam={call.toggleCam}
            onHangUp={call.hangUp}
          />
        )}

      {showCallHistory && (
        <CallHistoryPanel
          onClose={() => setShowCallHistory(false)}
          loading={loadingCallHistory}
          history={callHistory}
          chatUsername={chatInfo.username}
        />
      )}
    </HomeLayout>
  );
}
