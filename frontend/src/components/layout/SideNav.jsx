import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppLogo from "../../assets/logo/app-logo.svg";
import { disconnectChatSocket } from "../../socket/chatSocket";
import { logout } from "../../features/auth/authSlice"; // adjust path if needed
import {
  Home,
  Compass,
  Users,
  Bookmark,
  Heart,
  History,
  Mail,
  Bell,
  Video,
  User,
  FileText,
  Edit3,
  Settings,
  Crown,
  LogOut,
  X,
} from "lucide-react";

// simple dummy counts for now, replace with real data later
const mainLinks = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { label: "Liked Articles", icon: Heart, path: "/liked" },
  { label: "History", icon: History, path: "/history" },
];

// Messages badge is no longer hardcoded here — it's merged in at render
// time from the live unread count in redux (state.chat.unreadCount).
const communicationLinks = [
  { label: "Messages", icon: Mail, path: "/messages" },
  { label: "Notifications", icon: Bell, path: "/notifications", badge: 3 },
  { label: "Video Calls", icon: Video, path: "/video", tag: "New" },
];

const hubLinks = [
  { label: "My Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

// Caps the badge at "99+" so a big unread count doesn't blow out the pill.
function formatBadgeCount(count) {
  return count > 99 ? "99+" : String(count);
}

function NavItem({ label, icon: Icon, path, badge, tag, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={() => {
        navigate(path);
        onNavigate?.();
      }}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
      style={{
        borderRadius: "var(--radius-md)",
        backgroundColor: isActive ? "var(--primary)" : "transparent",
        color: isActive ? "var(--on-primary)" : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 500,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon size={18} />
      <span className="flex-1 text-left">{label}</span>
      {badge ? <span className="badge badge-danger">{badge}</span> : null}
      {tag ? <span className="badge badge-success">{tag}</span> : null}
    </button>
  );
}

export default function SideNav({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Live unread messages count, kept in sync in real time by
  // useUnreadMessagesSocket (mounted once near the app root).
  const unreadMessagesCount = useSelector(
    (state) => state.chat?.unreadCount ?? 0
  );

  const communicationLinksWithLiveData = communicationLinks.map((link) =>
    link.label === "Messages"
      ? {
          ...link,
          badge: unreadMessagesCount > 0 ? formatBadgeCount(unreadMessagesCount) : null,
        }
      : link
  );

  function handleLogout() {
    dispatch(logout());
    disconnectChatSocket();
    onClose();
    navigate("/login");
  }

  const content = (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between mb-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            navigate("/dashboard");
            onClose();
          }}
        >
          <img src={AppLogo} alt="App Logo" className="w-10 h-10 object-contain" />
          <span className="heading-md">TechSocial</span>
        </div>

        {/* Close button, mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden btn btn-ghost btn-icon"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main links */}
      <nav className="flex flex-col gap-1">
        {mainLinks.map((link) => (
          <NavItem key={link.label} {...link} onNavigate={onClose} />
        ))}
      </nav>

      {/* Communication */}
      <p
        className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        Communication
      </p>
      <nav className="flex flex-col gap-1">
        {communicationLinksWithLiveData.map((link) => (
          <NavItem key={link.label} {...link} onNavigate={onClose} />
        ))}
      </nav>

      {/* Your hub */}
      <p
        className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        Your Hub
      </p>
      <nav className="flex flex-col gap-1">
        {hubLinks.map((link) => (
          <NavItem key={link.label} {...link} onNavigate={onClose} />
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-red-600"
          style={{ borderRadius: "var(--radius-md)", fontWeight: 500 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={18} />
          <span className="flex-1 text-left">Log out</span>
        </button>
      </nav>

      {/* Premium card */}
      <div className="mt-auto pt-6">
        <div
          className="p-4"
          style={{
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--primary), var(--info))",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-yellow-300" />
            <span className="text-sm font-semibold" style={{ color: "var(--on-primary)" }}>
              Go Premium
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--on-primary)", opacity: 0.85 }}>
            Unlock advanced features, custom badges and ad-free experience.
          </p>
          <button
            className="btn w-full"
            style={{ backgroundColor: "var(--background)", color: "var(--primary)" }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar: always visible, part of layout flow */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 px-4 py-5 overflow-y-auto"
        style={{ backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {content}
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      {/* Mobile drawer: off-canvas, slides in over content */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 flex flex-col w-64 h-screen px-4 py-5 overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {content}
      </aside>
    </>
  );
}