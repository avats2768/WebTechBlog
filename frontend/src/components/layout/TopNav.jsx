import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Bell,
  Settings,
  MessageSquare,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";

import { logout } from "../../features/auth/authSlice"; // adjust path if needed
import { ThemeToggle } from "../../components/common/ThemeToggle"; // adjust path if needed

export default function TopNav({
  notificationCount = 3,
  onMenuClick = () => {},
}) {
  const storeUser = useSelector((state) => state.auth.user);
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

  function handleSearchSubmit(e) {
    e.preventDefault();
    console.log("search:", query);
  }

  function handleLogout() {
    dispatch(logout());
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

        <div
          className="flex flex-row hover:cursor-pointer"
          onClick={() => {
            navigate("/profile");
          }}
        >
          <button className="flex items-center gap-1.5">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0 hover:cursor-pointer"
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
          </button>

          <div className="px-4 py-3">
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
          className="btn btn-primary"
          onClick={() => navigate("/save-post")}
        >
          <Plus size={16} />
          <span className="hidden sm:inline"> Post</span>
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
                {notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/messages")}
            className="btn btn-ghost btn-icon hidden sm:inline-flex"
            title="Messages"
          >
            <MessageSquare size={18} />
          </button>

          <button
            onClick={() => {
              setProfileOpen(false);
              navigate("/settings");
            }}
            className="dropdown-item"
          >
            <Settings size={22} />
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-outline text-red-600 flex items-center gap-2"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}