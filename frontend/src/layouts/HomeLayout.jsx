import SideNav from "../components/layout/SideNav";
import TopNav from "../components/layout/TopNav";

export default function HomeLayout({ notificationCount = 3, children }) {
  return (
    <div className="flex min-h-screen">
      <SideNav />

      <div className="flex-1 min-w-0">
        <TopNav notificationCount={notificationCount} />
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}