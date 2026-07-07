import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { useSelector } from "react-redux";

import { onChatMessage, sendMessage } from "../../socket/chatSocket";

import {
    getChatHistory,
    markMessageAsRead
} from "../../api/chatApi";

function ChatAvatar({ src, name, online }) {
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

// Pulls a sender identifier out of a message regardless of which field
// name the backend/socket payload happens to use.
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

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);

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

  const handleStatus = (event) => {
    const status = event.detail;
    console.log("Status---->",status);
    
    if (status.userUuid === chat.userUuid) {
      setChatInfo((prev) => ({
        ...prev,
        online: status.online,
      }));
    }
  };

  const loadHistory = async () => {

    setLoadingHistory(true);

    try {

        const data =
            await getChatHistory(chat.roomUuid);

        setMessages(data);

        // Mark latest message as read
        if (data.length > 0) {

            const lastMessage =
                data[data.length - 1];

            await markMessageAsRead(
                chat.roomUuid,
                lastMessage.uuid
            );

        }

    } catch (error) {

        console.error(error);

    } finally {

        setLoadingHistory(false);

    }

};

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("handle Send chat-->",chat);
    
    sendMessage({
      receiverUuid: chat.userUuid,
       senderId: currentUserId,
      roomUuid: chat.roomUuid,
      message,
      messageType: "TEXT",
    });

    setMessage("");
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

        /* Only ONE element in this chain gets a percentage max-width.
           Nesting max-width:% on both a wrapper and its child is what
           caused bubbles to collapse to a single character per line. */
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
      `}</style>

      <div className="chat-page-wrap">
        {/* Header */}
        <div className="chat-header">
          <button
            className="chat-back-btn"
            onClick={() => navigate("/messages")}
            aria-label="Back to chats"
          >
            <ArrowLeft size={18} />
          </button>

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
                color: chatInfo.online ? "var(--success)" : "var(--text-secondary)",
              }}
            >
              {chatInfo.online ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="chat-messages">
          {!loadingHistory && messages.length === 0 && (
            <div className="chat-empty-state">
              <MessageCircle size={32} />
              <p className="body-sm">No messages yet. Say hello 👋</p>
            </div>
          )}

          {messages.map((msg) => {
            const senderId = getSenderId(msg);
            // senderId from the API is a plain integer (1, 2, ...) matching
            // the logged-in user's numeric id — NOT chat.userUuid, which is
            // a UUID for the other participant. Comparing against the UUID
            // was the bug that made every bubble render as "mine".
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

        {/* Input */}
        <div className="chat-input-row">
          <input
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
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
    </HomeLayout>
  );
}