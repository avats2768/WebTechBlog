import { useEffect, useState } from "react";
import HomeLayout from "../../layouts/HomeLayout";
import PostCard from "../../components/PostCard";
import { getHistory, getHistoryByType } from "../../api/historyApi";
import { useToast } from "../../context/ToastContext";
import { History } from "lucide-react";

const FILTERS = ["ALL", "VIEW", "LIKE", "COMMENT", "BOOKMARK"];

export default function HistoryPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [type, setType] = useState("ALL");

  const toast = useToast();

  useEffect(() => {
    loadHistory(type);
  }, [type]);

  const loadHistory = async (currentType) => {
    try {
      setLoading(true);
      setError(false);

      const data =
        currentType === "ALL"
          ? await getHistory()
          : await getHistoryByType(currentType);

      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Unable to load history");
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleBookmarkClick = () => {
    // Optional
    // If you already implemented bookmark logic inside PostCard,
    // nothing is needed here.
  };

  return (
    <HomeLayout>
      <div className="w-full mx-auto p-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <History size={20} style={{ color: "var(--primary)" }} />
          <h1 className="heading-md">Activity History</h1>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`btn ${type === item ? "btn-primary" : "btn-outline"}`}
              onClick={() => setType(item)}
              disabled={loading && type === item}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card p-lg text-center">Loading history...</div>
        ) : error ? (
          <div className="card p-lg text-center">
            <p>Unable to load history.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => loadHistory(type)}
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-lg text-center">
            <History
              size={32}
              style={{
                color: "var(--text-secondary)",
                marginBottom: 10,
              }}
            />
            <p className="body-md" style={{ fontWeight: 600 }}>
              No activity found
            </p>
            <p className="body-sm">
              Your viewed, liked, commented and bookmarked posts will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showBackButton={false}
                showEditDelete={false}
                onDeleted={() => handlePostDeleted(post.id)}
                onBookmarkClick={handleBookmarkClick}
              />
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}