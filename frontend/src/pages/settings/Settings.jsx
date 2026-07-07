import { useEffect, useState } from "react";
import ChangePasswordModal from "../../components/settings/ChangePasswordModal";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  AtSign,
  Megaphone,
  Moon,
  User,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

import HomeLayout from "../../layouts/HomeLayout";
import { Switch } from "../../components/common/FormControls";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { setNotificationSetting } from "../../features/settings/settingsSlice";
import { logout } from "../../features/auth/authSlice";

const STORAGE_KEY = "notificationSettings";

/* A card wrapper matching the .card styling used across the app. */
function SettingsCard({ title, description, children }) {
  return (
    <div className="card p-lg" style={{ marginBottom: 24 }}>
      <h3 className="heading-md">{title}</h3>
      {description && (
        <p className="body-sm" style={{ marginTop: 4 }}>
          {description}
        </p>
      )}
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

/* A row with an icon, label, description, and a control (Switch / ThemeToggle) on the right. */
function SettingsRow({ icon: Icon, title, description, control, disabled }) {
  return (
    <>
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 0",
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
          transition: "opacity 0.15s ease",
        }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Icon size={17} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {title}
            </p>
            {description && (
              <p className="body-sm" style={{ marginTop: 2 }}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0" style={{ marginLeft: 16 }}>
          {control}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--border)" }} />
    </>
  );
}

/* A row that navigates somewhere instead of holding a toggle. */
function LinkRow({ icon: Icon, title, description, onClick, danger }) {
  return (
    <>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between"
        style={{
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              backgroundColor: danger
                ? "color-mix(in srgb, var(--danger) 12%, transparent)"
                : "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: danger ? "var(--danger)" : "var(--primary)",
            }}
          >
            <Icon size={17} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p
              className="text-sm font-medium"
              style={{ color: danger ? "var(--danger)" : "var(--text-primary)" }}
            >
              {title}
            </p>
            {description && (
              <p className="body-sm" style={{ marginTop: 2 }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {!danger && (
          <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />
        )}
      </button>
      <div style={{ borderTop: "1px solid var(--border)" }} />
    </>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const settings = useSelector((state) => state.settings);

  // Persist whenever settings change, so toggles survive a page refresh
  // even without a dedicated backend endpoint.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  }, [settings]);

  function handleToggle(key, value) {
    dispatch(setNotificationSetting({ key, value }));
    toast.success("Settings updated.");
  }

  // Turning the master switch off dims and locks the sub-toggles rather
  // than resetting them — their individual preference is kept for when
  // push is turned back on.
  const pushDisabled = !settings.pushAllEnabled;

  async function handleLogout() {
    const ok = await confirm({
      title: "Log out",
      message: "You'll need to sign in again to access your account.",
      confirmLabel: "Log out",
      variant: "danger",
    });
    if (ok) {
      dispatch(logout());
      navigate("/login");
    }
  }

  return (
    <HomeLayout>
      <div className="p-6" style={{margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="heading-xl">Settings</h1>
          <p className="body-md" style={{ marginTop: 4 }}>
            Manage how TechSocial notifies you and looks.
          </p>
        </div>

        <SettingsCard
          title="Notifications"
          description="Choose what you want to be notified about."
        >
          <SettingsRow
            icon={Bell}
            title="All push notifications"
            description="Turn off to silence every notification below."
            control={
              <Switch
                checked={settings.pushAllEnabled}
                onChange={(value) => handleToggle("pushAllEnabled", value)}
              />
            }
          />

          <SettingsRow
            icon={MessageSquare}
            title="Chat messages"
            description="Get notified when someone sends you a message."
            disabled={pushDisabled}
            control={
              <Switch
                checked={settings.pushChatEnabled}
                onChange={(value) => handleToggle("pushChatEnabled", value)}
              />
            }
          />

          <SettingsRow
            icon={AtSign}
            title="Mentions & replies"
            description="Get notified when someone mentions or replies to you."
            disabled={pushDisabled}
            control={
              <Switch
                checked={settings.pushMentionsEnabled}
                onChange={(value) => handleToggle("pushMentionsEnabled", value)}
              />
            }
          />

          <SettingsRow
            icon={Megaphone}
            title="Product updates"
            description="Occasional news about new features."
            disabled={pushDisabled}
            control={
              <Switch
                checked={settings.pushProductEnabled}
                onChange={(value) => handleToggle("pushProductEnabled", value)}
              />
            }
          />
        </SettingsCard>

        <SettingsCard
          title="Appearance"
          description="Customize how TechSocial looks on this device."
        >
          <SettingsRow
            icon={Moon}
            title="Dark mode"
            description="Switch between light and dark theme."
            control={<ThemeToggle />}
          />
        </SettingsCard>

        <SettingsCard title="Account">
          <LinkRow
            icon={User}
            title="Edit profile"
            description="Update your username, bio and photo."
            onClick={() => navigate("/profile")}
          />
          <LinkRow
            icon={Lock}
            title="Change password"
            description="Update your account password."
            onClick={() => setChangePasswordOpen(true)}
          />
          <LinkRow
            icon={LogOut}
            title="Log out"
            danger
            onClick={handleLogout}
          />
        </SettingsCard>
      </div>
       <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </HomeLayout>
  );
}