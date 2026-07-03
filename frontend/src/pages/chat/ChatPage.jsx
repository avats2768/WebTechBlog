import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";

import {
  connectChatSocket,
  disconnectChatSocket,
  sendMessage,
} from "../../socket/chatSocket";

import { getChatHistory } from "../../api/chatApi";

function ChatAvatar({ src, name }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  return (
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
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { state: chat } = useLocation();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chat) {
      navigate("/chats");
      return;
    }

    loadHistory();

    const token = localStorage.getItem("token");

    connectChatSocket(token, (newMessage) => {
      if (newMessage.roomUuid === chat.roomUuid) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await getChatHistory(chat.roomUuid);
      // setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage({
      receiverUuid: chat.userUuid,
      roomUuid: chat.roomUuid,
      message,
      messageType: "TEXT",
    });

    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     senderUuid: "Me",
    //     message,
    //     createdAt: new Date(),
    //   },
    // ]);

    setMessage("");
  };

  if (!chat) return null;

  return (
    <HomeLayout>
      <style>{`
        .chat-page-wrap {
          max-width: 800px;
          margin: 20px auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          height: 85vh;
          background-color: var(--background);
          overflow: hidden;
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
        }
        .chat-back-btn:hover {
          background-color: var(--surface);
          color: var(--text-primary);
        }
        .chat-bubble-row {
          display: flex;
          margin-bottom: 12px;
        }
        .chat-bubble {
          padding: 10px 12px;
          border-radius: 14px;
          max-width: 70%;
          font-size: 14px;
          line-height: 1.4;
        }
        .chat-bubble-time {
          font-size: 11px;
          margin-top: 5px;
          color: var(--text-secondary);
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
        <div
          className="flex-center"
          style={{
            justifyContent: "flex-start",
            gap: 12,
            padding: 15,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            className="chat-back-btn"
            onClick={() => navigate("/messages")}
            aria-label="Back to chats"
          >
            <ArrowLeft size={18} />
          </button>

          <ChatAvatar src={chat.profileImage} name={chat.username} />

          <div>
            <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>
              {chat.username}
            </strong>
            <div
              style={{
                fontSize: 12,
                color: chat.online ? "var(--success)" : "var(--text-secondary)",
              }}
            >
              {chat.online ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 15,
            backgroundColor: "var(--surface)",
          }}
        >
          {messages.length === 0 && (
            <p
              className="body-sm"
              style={{ textAlign: "center", color: "var(--text-secondary)" }}
            >
              No messages yet. Say hello 👋
            </p>
          )}

          {messages.map((msg, index) => {
            const isTheirs = msg.senderUuid === chat.userUuid;
            return (
              <div
                key={index}
                className="chat-bubble-row"
                style={{ justifyContent: isTheirs ? "flex-start" : "flex-end" }}
              >
                <div
                  className="chat-bubble"
                  style={{
                    backgroundColor: isTheirs
                      ? "var(--background)"
                      : "color-mix(in srgb, var(--primary) 16%, var(--background))",
                    border: isTheirs ? "1px solid var(--border)" : "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <div>{msg.message}</div>
                  <div className="chat-bubble-time">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div
          className="flex-center chat-input-row"
          style={{
            gap: 10,
            padding: 15,
            borderTop: "1px solid var(--border)",
          }}
        >
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