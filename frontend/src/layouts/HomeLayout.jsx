import { useState } from "react";
import SideNav from "../components/layout/SideNav";
import TopNav from "../components/layout/TopNav";

export default function HomeLayout({ notificationCount = 3, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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