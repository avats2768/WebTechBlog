import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Code2,
  Check,
  Trash2,
  Pencil,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { timeAgo, initials } from "../utils/postUtils";
import { useNavigate } from "react-router-dom";
import {
  deletePost,
  getComments,
  toggleLike,
  addComment,
  deleteComment,
} from "../api/postsApi";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";

/**
 * PostCard
 *
 * Renders a single post: back button, author header, three-dot menu
 * (Code / Edit / Delete), bookmark icon, title/description, optional image,
 * skill badges, like/comment/view stats footer, and a toggleable comment
 * thread (list + add-comment input).
 *
 * Props:
 * - post: the post object (uuid, username, profession, createdAt, title,
 *          description, imageUrl, skills, likeCount, commentCount, viewCount)
 * - onDeleted(): optional callback fired after a successful delete
 * - onBookmarkClick(post): optional callback when bookmark icon is clicked
 * - showBackButton: optional, defaults to true. Set false to hide it
 *          (e.g. when PostCard is rendered inside a feed/list).
 * - showEditDelete: optional, defaults to true. Set false to hide the
 *          "Edit Post" and "Delete" menu items, leaving only "Copy Code"
 *          (e.g. when PostCard is rendered in a feed where the viewer
 *          isn't necessarily the post owner, like the Dashboard).
 * - currentUserId: optional. If passed, only comments authored by this
 *          user show a delete icon. If omitted, delete icons are hidden
 *          entirely (safer default since the comments API doesn't return
 *          an author name to confirm ownership visually).
 */
export default function PostCard({
  post,
  onDeleted,
  onBookmarkClick,
  showBackButton = true,
  showEditDelete = false,
  currentUserId,
}) {
  const loggedInUserId = useSelector((state) => state.auth.user?.userId);
  const resolvedUserId = currentUserId ?? loggedInUserId;

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [commentCount, setCommentCount] = useState(post.commentCount);

  // close the menu when clicking anywhere else on the page
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = () => setMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation(); // prevent the outside-click listener from instantly closing it
    setMenuOpen((prev) => !prev);
  };

  const handleCopyCodeClick = async () => {
    try {
      await navigator.clipboard.writeText(post.code ?? "");
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  };

  function handleOpenPost(post) {
    navigate(`/post/${post.id}`);
  }

  const handleEditPost = () => {
    navigate(`/save-post?id=${post.id}`);
    setMenuOpen(false);
  };

  const handleDeletePost = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);

    const ok = await confirm({
      title: "Delete post",
      message:
        "Are you sure you want to delete this post? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
      handler: async () => {
        await deletePost(post.id);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete post");
      },
    });

    if (!ok) return;

    toast.success("Post deleted successfully");
    setTimeout(() => {
      onDeleted?.();
    }, 1000);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await toggleLike(post.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      toast.error("Unable to like post");
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await getComments(post.id);
      // newest first, defensively sorted in case the API order ever changes
      const sorted = [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setComments(sorted);
      setCommentCount(sorted.length);
    } catch {
      toast.error("Unable to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentClick = async (e) => {
    e.stopPropagation();

    const opening = !showComments;
    setShowComments(opening);

    if (opening) {
      await loadComments();
    }
  };

  const handleAddComment = async () => {
  const text = comment.trim();
  if (!text || submitting) return;

  try {
    setSubmitting(true);
    const { data } = await addComment(post.id, text);
    setComment("");
    await loadComments();
    setCommentCount(data.commentCount);
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

  const handleDeleteComment = async (e, commentId) => {
  e.stopPropagation();
  try {
    const { data } = await deleteComment(commentId);
    await loadComments();
    setCommentCount(data.commentCount);
    toast.success(data.message || "Comment deleted");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to delete comment");
  }
};

  const commentAuthorLabel = (c) => {
    if (c.firstName) return `${c.firstName} ${c.lastName || ""}`.trim();
    if (resolvedUserId && c.userId === resolvedUserId) return "You";
    return `User #${c.userId}`;
  };

  return (
    <article
      className="card card-hover p-lg cursor-pointer"
      onClick={() => handleOpenPost?.(post)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
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

        {/* Bookmark + three-dot menu */}
        <div className="flex items-center gap-3 relative">
          <Bookmark
            size={17}
            className="cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkClick?.(post);
            }}
          />
          <MoreHorizontal
            size={17}
            className="cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onClick={toggleMenu}
          />

          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-10 card flex flex-col gap-1 p-2"
              style={{
                minWidth: 130,
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 text-sm text-left px-3 py-2 rounded hover:opacity-80"
                style={{
                  color: copied
                    ? "var(--success,#16a34a)"
                    : "var(--text-primary)",
                  width: "100%",
                  whiteSpace: "nowrap",
                }}
                onClick={handleCopyCodeClick}
              >
                {copied ? <Check size={14} /> : <Code2 size={14} />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>

              {showEditDelete && (
                <>
                  <button
                    className="flex items-center gap-2 text-sm text-left px-3 py-2 rounded hover:opacity-80"
                    style={{ color: "var(--text-primary)" }}
                    onClick={handleEditPost}
                  >
                    <Pencil size={14} />
                    Edit Post
                  </button>
                  <button
                    className="flex items-center gap-2 text-sm text-left px-3 py-2 rounded hover:opacity-80"
                    style={{ color: "var(--danger)" }}
                    onClick={handleDeletePost}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="heading-md" style={{ marginBottom: 8 }}>
        {post.title}
      </h2>
      <p className="body-md" style={{ marginBottom: 12 }}>
        {post.description}
      </p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full rounded-lg mb-4 object-cover"
          style={{ maxHeight: 320 }}
        />
      )}

      {post.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.skills.map((skill) => (
            <span
              key={skill}
              className="badge"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center gap-4 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="flex items-center gap-1.5">
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
              className="cursor-pointer"
              style={{ color: liked ? "#ef4444" : "var(--text-secondary)" }}
              onClick={handleLike}
            />
            {likeCount ?? post.likeCount}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle
              size={18}
              className="cursor-pointer"
              style={{
                color: showComments
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              }}
              onClick={handleCommentClick}
            />{" "}
            {commentCount ?? post.commentCount}
          </span>
        </div>
        <span className="body-sm">{post.viewCount} views</span>
      </div>

      {/* Comment thread — only rendered once toggled open */}

      <div className="mt-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
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
        {showComments && (
          <div className="flex flex-col gap-3 mt-4">
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
                  className="flex items-start justify-between gap-2"
                >
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

                  {resolvedUserId && c.userId === resolvedUserId && (
                    <Trash2
                      size={14}
                      className="cursor-pointer"
                      style={{
                        color: "var(--danger)",
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                      onClick={(e) => handleDeleteComment(e, c.id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </article>
  );
}
