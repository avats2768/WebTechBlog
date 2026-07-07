import { useEffect, useState } from "react";
import { getAllPosts } from "../../api/postsApi";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../../layouts/HomeLayout";
import PostCard from "../../components/PostCard";

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
              Welcome back, {user?.username || ""}! 👋
            </h1>
            <p className="body-md" style={{ marginTop: 4 }}>
              Discover, share and grow with the tech community.
            </p>
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