import { useEffect, useState } from "react";
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
} from "lucide-react";
import { timeAgo, initials } from "../utils/postUtils";
import { useNavigate } from "react-router-dom";
import { deletePost } from "../api/postsApi";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";

/**
 * PostCard
 *
 * Renders a single post: back button, author header, three-dot menu
 * (Code / Edit / Delete), bookmark icon, title/description, optional image,
 * skill badges, and the like/comment/view stats footer.
 *
 * Props:
 * - post: the post object (uuid, username, profession, createdAt, title,
 *          description, imageUrl, skills, likeCount, commentCount, viewCount)
 * - onDeleted(): optional callback fired after a successful delete
 * - onBookmarkClick(post): optional callback when bookmark icon is clicked
 * - showBackButton: optional, defaults to true. Set false to hide it
 *          (e.g. when PostCard is rendered inside a feed/list).
 */
export default function PostCard({
  post,
  onDeleted,
  onBookmarkClick,
  showBackButton = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

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
            <Heart size={16} style={{ color: "var(--danger)" }} />{" "}
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={16} /> {post.commentCount}
          </span>
        </div>
        <span className="body-sm">{post.viewCount} views</span>
      </div>
    </article>
  );
}
