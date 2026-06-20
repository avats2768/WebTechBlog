import SideNav from "../components/layout/SideNav";
import TopNav from "../components/layout/TopNav";

export default function HomeLayout({ notificationCount = 3, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideNav />

      <div className="flex-1 min-w-0">
        <TopNav notificationCount={notificationCount} />
        <main>{children}</main>
      </div>
    </div>
  );
}