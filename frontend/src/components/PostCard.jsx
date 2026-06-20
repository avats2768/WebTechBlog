import { useEffect, useState } from "react";
import { Heart, MessageCircle, Bookmark, Code2, Check, Pencil, MoreHorizontal } from "lucide-react";
import { timeAgo, initials } from "../utils/postUtils";

/**
 * PostCard
 *
 * Renders a single post: author header, three-dot menu (Code / Edit),
 * bookmark icon, title/description, optional image, skill badges,
 * and the like/comment/view stats footer.
 *
 * Props:
 * - post: the post object (uuid, username, profession, createdAt, title,
 *          description, imageUrl, skills, likeCount, commentCount, viewCount)
 * - onCodeClick(post): optional callback when "Code" menu item is clicked
 * - onEditClick(post): optional callback when "Edit" menu item is clicked
 * - onBookmarkClick(post): optional callback when bookmark icon is clicked
 */
export default function PostCard({ post, onCodeClick, onEditClick, onBookmarkClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyCodeClick = () => {
    onCodeClick?.(post);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  return (
    <article className="card card-hover p-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}
          >
            {initials(post.username)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {post.username}
            </p>
            <p className="body-sm">
              {post.profession} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Bookmark + three-dot menu */}
        <div className="flex items-center gap-3 relative">
          <Bookmark
            size={17}
            className="cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => onBookmarkClick?.(post)}
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
              style={{ minWidth: 130, backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-2 text-sm text-left px-3 py-2 rounded hover:opacity-80"
                style={{
                  color: copied ? "var(--success, #16a34a)" : "var(--text-primary)",
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
                onClick={() => {
                  onEditClick?.(post);
                  setMenuOpen(false);
                }}
              >
                <Pencil size={14} />
                Edit Post
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 className="heading-md" style={{ marginBottom: 8 }}>{post.title}</h2>
      <p className="body-md" style={{ marginBottom: 12 }}>{post.description}</p>

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
              style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <Heart size={16} style={{ color: "var(--danger)" }} /> {post.likeCount}
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