import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import PostCard from "../../components/PostCard";
import { getBookmarks } from "../../api/bookmarkApi";
import { useToast } from "../../context/ToastContext";
import HomeLayout from "../../layouts/HomeLayout";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getBookmarks();

      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Unable to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = (post, bookmarked) => {
  if (!bookmarked) {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }
};



  if (loading) {
    return (
      <HomeLayout>
        <div className="w-full mx-auto p-lg">
          <div className="card p-lg text-center">Loading bookmarks...</div>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="w-full mx-auto p-lg">
          <div className="card p-lg text-center">
            <p>Unable to load bookmarks.</p>

            <button className="btn btn-primary mt-3" onClick={loadBookmarks}>
              Try Again
            </button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="w-full mx-auto p-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark size={20} style={{ color: "var(--primary)" }} />

          <h1 className="heading-md">Bookmarks</h1>
        </div>

        {posts.length === 0 ? (
          <div className="card p-lg text-center">
            <Bookmark
              size={30}
              style={{
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            />

            <p className="body-md" style={{ fontWeight: 600 }}>
              No bookmarks yet
            </p>

            <p className="body-sm">Bookmark posts to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showBackButton={false}
                showEditDelete={false}
                onBookmarkClick={() => handleBookmarkClick(post)}
              />
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
