import { useState } from "react";
import SideNav from "../components/layout/SideNav";
import TopNav from "../components/layout/TopNav";
import useUnreadMessagesSocket from "../hooks/useUnreedMessageSocket";

export default function HomeLayout({ notificationCount = 3, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Opens one socket connection and keeps state.chat.unreadCount in sync
  // in real time. Mounted here (once, at the layout level) so it stays
  // alive for as long as the user is in the app, and so SideNav/TopNav
  // don't each try to open their own connection.
  useUnreadMessagesSocket();

  return (
    <div className="flex min-h-screen w-full">
      <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav
          notificationCount={notificationCount}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  );
}