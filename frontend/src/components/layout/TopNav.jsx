import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { disconnectChatSocket } from "../../socket/chatSocket";
import {
  Search,
  Plus,
  BotMessageSquare,
  Bell,
  Settings,
  MessageSquare,
  ChevronDown,
  LogOut,
  Menu,
  User,
  Eye,
} from "lucide-react";

import { logout } from "../../features/auth/authSlice"; // adjust path if needed
import { ThemeToggle } from "../../components/common/ThemeToggle"; // adjust path if needed
import useUnreadMessagesSocket from "../../hooks/useUnreedMessageSocket";

// Caps the badge at "99+" so a big unread count doesn't blow out the pill.
function formatBadgeCount(count) {
  return count > 9 ? "9+" : String(count);
}

export default function TopNav({
  notificationCount = 3,
  onMenuClick = () => {},
}) {
  const storeUser = useSelector((state) => state.auth.user);

  // Live unread messages count, kept in sync in real time by
  // useUnreadMessagesSocket (mounted once near the app root).
  const unreadMessagesCount = useSelector(
    (state) => state.chat?.unreadCount ?? 0,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the dropdown on Escape for keyboard users
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    console.log("search:", query);
  }

  function handleLogout() {
    setProfileOpen(false);
    dispatch(logout());
    disconnectChatSocket();
    navigate("/login");
  }

  const displayName = storeUser?.username || "Guest";
  const displayEmail = storeUser?.email || "";
  const profileImage = storeUser?.profileImage || null;

  // Reset error state whenever the image path in the store changes
  useEffect(() => {
    setImgError(false);
  }, [profileImage]);

  return (
    <header
      className="sticky w-full top-0 z-30"
      style={{
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-4 h-16 px-4 md:px-6 w-full">
        {/* Hamburger, mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn btn-ghost btn-icon shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 max-w-xl">
          <div
            className="flex items-center gap-2 h-10 px-3"
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Search size={16} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, people, tags..."
              className="bg-transparent outline-none border-none flex-1 text-sm min-w-0"
              style={{ color: "var(--text-primary)" }}
            />
            <kbd
              className="hidden md:inline-block text-[10px] rounded px-1.5 py-0.5"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              ⌘ K
            </kbd>
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/save-post")}
          >
            <Plus size={16} />
            <span className="hidden sm:inline"> Post</span>
          </button>

          <ThemeToggle />

          <button
            onClick={() => navigate("/notifications")}
            className="btn btn-ghost btn-icon relative"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] leading-[16px] text-center font-semibold"
                style={{
                  backgroundColor: "var(--danger)",
                  color: "var(--on-danger)",
                }}
              >
                {formatBadgeCount(notificationCount)}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/messages")}
            className="btn btn-ghost btn-icon relative hidden sm:inline-flex"
            title="Messages"
          >
            <MessageSquare size={18} />
            {unreadMessagesCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] leading-[16px] text-center font-semibold"
                style={{
                  backgroundColor: "var(--danger)",
                  color: "var(--on-danger)",
                }}
              >
                {formatBadgeCount(unreadMessagesCount)}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/ai-response")}
            className="btn btn-ghost btn-icon relative hidden sm:inline-flex"
            title="AI Chat Bot"
          >
            <BotMessageSquare size={18} />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-full hover:cursor-pointer"
              style={{
                backgroundColor: profileOpen ? "var(--surface)" : "transparent",
              }}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--primary) 14%, transparent)",
                  color: "var(--primary)",
                }}
              >
                {profileImage && !imgError ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </span>

              <ChevronDown
                size={16}
                style={{
                  color: "var(--text-secondary)",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] w-56 py-1 z-40"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                {/* User info recap, useful on mobile where name/email are hidden on the trigger */}
                <div
                  className="flex items-center gap-3 px-4 py-2"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "var(--surface-secondary)" }}
                  >
                    <User
                      size={18}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {displayName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="dropdown-item w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Eye size={15} />
                  View profile
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="dropdown-item w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Settings size={15} />
                  Settings
                </button>

                <div
                  style={{ borderTop: "1px solid var(--border)" }}
                  className="my-1"
                />

                <button
                  onClick={handleLogout}
                  className="dropdown-item w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 hover:cursor-pointer"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
