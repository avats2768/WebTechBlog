import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import PostCard from "../../components/PostCard";
import { getLikedPosts } from "../../api/postsApi";
import { useToast } from "../../context/ToastContext";
import HomeLayout from "../../layouts/HomeLayout";

export default function LikedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadLikedPosts();
  }, []);

  const loadLikedPosts = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await getLikedPosts();

      setPosts(response.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Unable to load liked posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeClick = (post, liked) => {
    if (!liked) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    }
  };

  if (loading) {
    return (
      <HomeLayout>
        <div className="w-full mx-auto p-lg">
          <div className="card p-lg text-center">Loading liked posts...</div>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="w-full mx-auto p-lg">
          <div className="card p-lg text-center">
            <p>Unable to load liked posts.</p>

            <button className="btn btn-primary mt-3" onClick={loadLikedPosts}>
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
          <Heart size={20} style={{ color: "var(--primary)" }} />

          <h1 className="heading-md">Liked Posts</h1>
        </div>

        {posts.length === 0 ? (
          <div className="card p-lg text-center">
            <Heart
              size={30}
              style={{
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            />

            <p className="body-md" style={{ fontWeight: 600 }}>
              No liked posts yet
            </p>

            <p className="body-sm">Like posts to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showBackButton={false}
                showEditDelete={false}
                onLikeClick={() => handleLikeClick(post)}
              />
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}