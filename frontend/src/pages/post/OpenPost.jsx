import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Trash2,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { timeAgo, initials } from "../../utils/postUtils";
import HomeLayout from "../../layouts/HomeLayout";
import {
  getPostById,
  getComments,
  addComment,
  deleteComment,
  toggleLike,
} from "../../api/postsApi";

import { toggleBookmark } from "../../api/bookmarkApi";
import { useToast } from "../../context/ToastContext";

export default function OpenPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUserId = useSelector((state) => state.auth.user?.userId);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;

    setLiked(post.isLiked);

    setLikeCount(post.likeCount);

    setBookmarked(post.isBookmarked);
  }, [post]);

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([fetchPost(), loadComments()]);
    };

    load();
  }, [id]);

  async function fetchPost() {
    try {
      setLoading(true);
      setNotFound(false);

      const response = await getPostById(id);

      if (response.data?.success) {
        const postData = response.data.data;

        setPost(postData);
        setCommentCount(postData.commentCount);
        setLikeCount(postData.likeCount);
        setLiked(postData.isLiked);
        setBookmarked(postData.isBookmarked);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      setCommentsLoading(true);
      const res = await getComments(id);
      const sorted = [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setComments(sorted);
      setCommentCount(sorted.length);
    } catch (err) {
      console.error("Failed to fetch comments", err);
      toast.error("Unable to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(id);

      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to like post");
    }
  };

  const handleAddComment = async () => {
    const text = comment.trim();

    if (!text || submitting) return;

    try {
      setSubmitting(true);

      const { data } = await addComment(id, text);

      setComment("");

      if (data.data) {
        setComments((prev) => [data.data, ...prev]);
        setCommentCount((prev) => prev + 1);
      } else {
        await loadComments();
      }

      toast.success(data.message || "Comment added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await deleteComment(commentId);

      setComments((prev) => prev.filter((c) => c.id !== commentId));

      setCommentCount((prev) => Math.max(prev - 1, 0));

      toast.success(data.message || "Comment deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const commentAuthorLabel = (c) => {
    if (c.firstName) return `${c.firstName} ${c.lastName || ""}`.trim();
    if (currentUserId && c.userId === currentUserId) return "You";
    return `User #${c.userId}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(post.code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const { data } = await toggleBookmark(id);

      if (typeof data.bookmarked === "boolean") {
      setBookmarked(data.bookmarked);
    } else {
      setBookmarked((prev) => !prev);
    }

    toast.success(
      data.bookmarked ? "Post bookmarked" : "Bookmark removed"
    );
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update bookmark");
    }
  };

  const handleOpenProfile = () => {
    navigate(`/public-profile/${post.userUuid}`);
  };

  // --- Loading state -----------------------------------------------
  if (loading) {
    return (
      <HomeLayout>
        <div
          className="mx-auto"
          style={{ maxWidth: "1000px", padding: "24px" }}
        >
          <div
            className="card"
            style={{ overflow: "hidden", marginTop: "20px" }}
          >
            {/* Image placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                width: "100%",
                height: "360px",
                backgroundColor: "var(--surface)",
              }}
            />

            <div className="p-lg">
              {/* Author row placeholder */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "var(--surface)",
                  }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div
                    className="skeleton-pulse"
                    style={{
                      width: 140,
                      height: 12,
                      borderRadius: 4,
                      backgroundColor: "var(--surface)",
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      width: 100,
                      height: 10,
                      borderRadius: 4,
                      backgroundColor: "var(--surface)",
                    }}
                  />
                </div>
              </div>

              {/* Title placeholder */}
              <div
                className="skeleton-pulse"
                style={{
                  width: "70%",
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "var(--surface)",
                  marginBottom: 16,
                }}
              />

              {/* Body placeholder */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  className="skeleton-pulse"
                  style={{
                    width: "100%",
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: "var(--surface)",
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    width: "95%",
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: "var(--surface)",
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    width: "80%",
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: "var(--surface)",
                  }}
                />
              </div>
            </div>
          </div>

          <style>{`
            .skeleton-pulse {
              animation: skeleton-pulse-anim 1.4s ease-in-out infinite;
            }
            @keyframes skeleton-pulse-anim {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}</style>
        </div>
      </HomeLayout>
    );
  }

  // --- Not found / failed fetch -------------------------------------
  if (notFound || !post) {
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
      <div className="mx-auto" style={{ maxWidth: "1000px", padding: "24px" }}>
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
              <button
                className="btn btn-ghost btn-icon"
                onClick={handleBookmark}
              >
                <Bookmark
                  size={18}
                  fill={bookmarked ? "currentColor" : "none"}
                  style={{
                    color: bookmarked
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                    transition: "all .2s ease",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="card" style={{ overflow: "hidden", marginTop: "20px" }}>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              alt={post.title}
              className="w-full object-cover"
              style={{
                maxHeight: "700px",
                width: "100%",
              }}
            />
          )}

          <div className="p-lg">
            <div
              className="flex items-center gap-3 mb-6 cursor-pointer"
              onClick={handleOpenProfile}
            >
              {post.profileImage ? (
                <img
                  src={post.profileImage}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
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

            <h1
              className="heading-xl"
              style={{ marginBottom: "16px", color: "var(--text-primary)" }}
            >
              {post.title}
            </h1>

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

            {post.skills?.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                style={{ marginTop: "24px" }}
              >
                {post.skills.map((skill) => (
                  <span key={skill} className="badge">
                    {skill}
                  </span>
                ))}
              </div>
            )}

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

        {/* Comments */}
        <div className="card p-lg" style={{ marginTop: "20px" }}>
          <h3 className="heading-md" style={{ marginBottom: "16px" }}>
            Comments {commentCount > 0 && `(${commentCount})`}
          </h3>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={comment}
              placeholder="Write a comment..."
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              disabled={submitting}
            />
            <button
              className="btn btn-primary flex items-center gap-1.5"
              onClick={handleAddComment}
              disabled={submitting || !comment.trim()}
            >
              <Send size={14} />
              Send
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-5">
            {commentsLoading ? (
              <p className="body-sm">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="body-sm">
                No comments yet. Be the first to comment.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--primary) 14%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      {initials(c.firstName || "U")}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {commentAuthorLabel(c)}{" "}
                        <span className="body-sm" style={{ fontWeight: 400 }}>
                          · {c.createdAt ? timeAgo(c.createdAt) : "just now"}
                        </span>
                      </p>
                      <p
                        className="body-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.comment}
                      </p>
                    </div>
                  </div>

                  {currentUserId && c.userId === currentUserId && (
                    <Trash2
                      size={14}
                      className="cursor-pointer"
                      style={{
                        color: "var(--danger)",
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                      onClick={() => handleDeleteComment(c.id)}
                    />
                  )}
                </div>
              ))
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
            style={{ color: "var(--text-secondary)" }}
          >
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLike}
            >
              <Heart
                size={18}
                fill={liked ? "currentColor" : "none"}
                style={{
                  color: liked ? "var(--danger)" : "var(--text-secondary)",
                }}
              />
              {likeCount}
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              {commentCount}
            </div>

            {/* <div className="flex items-center gap-2">
              <Eye size={18} />
              {post.viewCount}
            </div> */}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
