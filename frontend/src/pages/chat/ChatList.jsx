import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare } from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { useDispatch } from "react-redux";
import { getMyChats } from "../../api/chatApi";
import { onChatStatus } from "../../socket/chatSocket";
import { setChatsMeta } from "../../features/chat/chatSlice";

/* Avatar with graceful fallback to initials, same pattern as TopNav */
function ChatAvatar({ src, name }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").slice(0, 2).toUpperCase();

  return (
    <span
      className="chat-avatar"
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

function ChatSkeleton() {
  return (
    <div className="chat-row chat-skeleton">
      <span className="chat-avatar skeleton-block" />
      <div style={{ flex: 1 }}>
        <div className="skeleton-block" style={{ width: "40%", height: 12, marginBottom: 8 }} />
        <div className="skeleton-block" style={{ width: "70%", height: 10 }} />
      </div>
    </div>
  );
}

export default function ChatList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState("");

useEffect(() => {
    loadChats();

    const unsubscribe = onChatStatus((status) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.userUuid === status.userUuid
            ? { ...chat, online: status.online }
            : chat
        )
      );
    });

    return () => {
      unsubscribe();
      // No disconnectChatSocket() here either.
    };
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await getMyChats();
      setChats(data);
      dispatch(setChatsMeta(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.username?.toLowerCase().includes(q) ||
        chat.lastMessage?.toLowerCase().includes(q)
    );
  }, [chats, query]);

  return (
    <HomeLayout>
      <style>{`
        .chat-page {
          margin: 0 auto;
          padding: 24px 16px 40px;
        }
        .chat-search {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 14px;
          margin-bottom: 18px;
          background-color: var(--surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        .chat-search input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
        }
        .chat-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chat-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background-color: var(--background);
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .chat-row:hover {
          background-color: var(--surface);
          border-color: color-mix(in srgb, var(--primary) 30%, var(--border));
        }
        .chat-avatar {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          overflow: hidden;
        }
        .chat-info {
          flex: 1;
          min-width: 0;
        }
        .chat-info-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .chat-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-time {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .chat-preview-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }
        .chat-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .chat-preview {
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-unread {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background-color: var(--primary);
          color: var(--on-primary, #fff);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          padding: 60px 20px;
          color: var(--text-secondary);
        }
        .skeleton-block {
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            var(--surface) 25%,
            color-mix(in srgb, var(--surface) 60%, var(--border)) 37%,
            var(--surface) 63%
          );
          background-size: 400% 100%;
          animation: chat-shimmer 1.4s ease infinite;
        }
        .chat-avatar.skeleton-block {
          border-radius: 50%;
        }
        @keyframes chat-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <div className="chat-page">
        <h2 className="heading-lg" style={{ margin: "0 0 16px" }}>
          Messages
        </h2>

        <div className="chat-search">
          <Search size={16} style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
          />
        </div>

        {loading && (
          <div className="chat-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <ChatSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && filteredChats.length === 0 && (
          <div className="chat-empty">
            <MessageSquare size={36} style={{ color: "var(--text-secondary)" }} />
            <p className="body-md" style={{ margin: 0, color: "var(--text-primary)" }}>
              {chats.length === 0 ? "No conversations yet" : "No matches found"}
            </p>
            <p className="body-sm" style={{ margin: 0 }}>
              {chats.length === 0
                ? "Start a chat and it will show up here."
                : "Try a different search term."}
            </p>
          </div>
        )}

        {!loading && filteredChats.length > 0 && (
          <div className="chat-list">
            {filteredChats.map((chat) => (
              <div
                key={chat.roomUuid}
                className="chat-row"
                onClick={() => navigate("/chat", { state: chat })}
              >
                <ChatAvatar src={chat.profileImage} name={chat.username} />

                <div className="chat-info">
                  <div className="chat-info-top">
                    <span className="chat-name">{chat.username}</span>
                    <span className="chat-time">
                      {chat.lastMessageAt
                        ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="chat-preview-row">
                    <span
                      className="chat-dot"
                      style={{
                        backgroundColor: chat.online
                          ? "var(--success)"
                          : "var(--text-secondary)",
                      }}
                    />
                    <span className="chat-preview">
                      {chat.lastMessage || "No messages yet"}
                    </span>
                  </div>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="chat-unread">{chat.unreadCount}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}