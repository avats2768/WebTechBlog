import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Code2,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { timeAgo, initials } from "../../utils/postUtils";
import HomeLayout from "../../layouts/HomeLayout";
import { getPostById } from "../../api/postsApi";

export default function OpenPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = () => setMenuOpen(false);

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menuOpen]);

  async function fetchPost() {
    try {
      setLoading(true);

      const response = await getPostById(id);

      if (response.data?.success) {
        setPost(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(post.code || "");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  };

  if (!post) {
    return (
      <HomeLayout>
        <div
          className="flex items-center justify-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="card p-lg">
            <p className="body-md">Post not found</p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div
        className="mx-auto"
        style={{
          maxWidth: "1000px",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-20 backdrop-blur-md border-default"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--background) 90%, transparent)",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
          }}
        >
          <div className="flex items-center justify-between p-md">
            <button onClick={() => navigate(-1)} className="btn btn-ghost">
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="flex items-center gap-2 relative">
              <button className="btn btn-ghost btn-icon">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="card"
          style={{
            overflow: "hidden",
            marginTop: "20px",
          }}
        >
          {/* Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full object-cover"
              style={{
                maxHeight: "700px",
                width: "100%",
              }}
            />
          )}

          {/* Content */}
          <div className="p-lg">
            {/* Author */}
            <div className="flex items-center gap-3 mb-6">
              {post.profileImage ? (
                <img
                  src={post.profileImage}
                  alt={`${post.firstName} profile`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--primary) 14%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {initials(post.firstName)}
                </div>
              )}
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {post.firstName} {post.lastName}
                </p>
                <p className="body-sm">
                  {post.designation} · {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Title */}
            <h1
              className="heading-xl"
              style={{
                marginBottom: "16px",
                color: "var(--text-primary)",
              }}
            >
              {post.title}
            </h1>

            {/* Description */}
            <div
              className="body-md"
              style={{
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.9,
                fontSize: "1.05rem",
              }}
            >
              {post.description}
            </div>

            {/* Skills */}
            {post.skills?.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                style={{
                  marginTop: "24px",
                }}
              >
                {post.skills.map((skill) => (
                  <span key={skill} className="badge">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Code */}
            {post.code && (
              <div style={{ marginTop: "32px" }}>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "12px" }}
                >
                  <h3 className="heading-md">Code</h3>

                  <button
                    className={`btn ${copied ? "btn-success" : "btn-outline"}`}
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <pre
                  className="card"
                  style={{
                    padding: "20px",
                    overflowX: "auto",
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    maxHeight: "500px",
                  }}
                >
                  <code>{post.code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div
          className="sticky bottom-0 backdrop-blur-md border-default"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--background) 92%, transparent)",
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
            marginTop: "20px",
          }}
        >
          <div
            className="flex items-center justify-center gap-10 py-4"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <div className="flex items-center gap-2">
              <Heart
                size={18}
                style={{
                  color: "var(--danger)",
                }}
              />
              {post.likeCount}
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              {post.commentCount}
            </div>

            <div className="flex items-center gap-2">
              <Eye size={18} />
              {post.viewCount}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
