import { useEffect, useState } from "react";
import { getAllPosts } from "../../api/postsApi";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import PostCard from "../../components/PostCard";

// ---- dummy sidebar data, swap with real API data later ----
const stories = [
  {
    id: 1,
    label: "React",
    color: "bg-cyan-100 text-cyan-600",
    members: "145k members",
  },
  {
    id: 2,
    label: "JS",
    color: "bg-yellow-400 text-white",
    members: "198k members",
  },
  {
    id: 3,
    label: "Nx",
    color: "bg-slate-900 text-white",
    members: "87k members",
  },
  {
    id: 4,
    label: "DevOps",
    color: "bg-blue-100 text-blue-600",
    members: "112k members",
  },
  {
    id: 5,
    label: "Py",
    color: "bg-blue-500 text-white",
    members: "159k members",
  },
  {
    id: 6,
    label: "TS",
    color: "bg-sky-500 text-white",
    members: "101k members",
  },
];

const communities = [
  { name: "Frontend Masters", members: "124k members" },
  { name: "Backend Brigade", members: "98k members" },
  { name: "DevOps Hub", members: "76k members" },
];

const tabs = ["For you", "Following", "Trending"];

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("For you");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getAllPosts();
      if (response.data?.success) {
        setPosts(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Welcome banner */}
          <div className="mb-6">
            <h1 className="heading-xl">
              Welcome back, {user?.username || "John"}! 👋
            </h1>
            <p className="body-md" style={{ marginTop: 4 }}>
              Discover, share and grow with the tech community.
            </p>
          </div>

          {/* Stories row */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <Plus size={18} style={{ color: "var(--primary)" }} />
              </div>
              <span className="body-sm">Your Story</span>
            </div>
            {stories.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold ${s.color}`}
                >
                  {s.label}
                </div>
                <span className="body-sm">{s.members}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts */}
           {loading ? (
            <p className="body-md">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="body-md">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {posts.map((post) => (
                <PostCard
                  key={post.uuid}
                  post={post}
                  onDeleted={fetchPosts}
                  showEditDelete={false}
                />
              ))}
            </div>
          )}

          {/* Communities you might like */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading-md">Communities You Might Like</h3>
              <button
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {communities.map((c) => (
                <div
                  key={c.name}
                  className="card flex items-center justify-between p-md"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full"
                      style={{ backgroundColor: "var(--surface)" }}
                    />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.name}
                      </p>
                      <p className="body-sm">{c.members}</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}