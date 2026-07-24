import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProfileImage } from "../../features/auth/authSlice"; // adjust path
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Link,
  Globe,
  Pencil,
  BadgeCheck,
  Heart,
  MessageCircle,
  FileText,
  Bookmark,
  RotateCw,
  LayoutGrid,
  User,
} from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { getMyPosts } from "../../api/postsApi";
import { getProfile } from "../../api/userApi";
import { getSkillsByIds } from "../../api/choiceApis/skillApi";
import PostCard from "../../components/PostCard";

// Your backend serves relative paths for profile/cover images (e.g.
// "/public/cover/cover_img1.jpeg") but absolute URLs for post images.
// Replace this with wherever your real API base URL lives (env var,
// axios baseURL, config file, etc) instead of hardcoding it here.

/* ---------- Static fallback data ----------
   These fields don't exist in the current /profile or /posts APIs yet.
   Swap each block out once the backend supports it. */

const STATIC_FALLBACK = {
  verified: true,
  joined: "May 2023",
  bookmarksCount: 56,
};

/* ---------- Page ---------- */

export default function ProfilePage() {
  const storeUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, []); // run once on mount — the missing [] here was causing an infinite loop

  async function fetchProfile() {
    try {
      setLoadingProfile(true);
      const response = await getProfile();
      if (response.data?.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        dispatch(setProfileImage(profileData.profileImage || null));
        loadSkills(profileData.skills);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function loadSkills(skillsRaw) {
    try {
      const skillIds = skillsRaw ? JSON.parse(skillsRaw) : [];
      if (!skillIds.length) {
        setSkills([]);
        return;
      }

      setLoadingSkills(true);
      const response = await getSkillsByIds(skillIds);
      const skillsData = response?.data || response || [];
      setSkills(skillsData);
    } catch (error) {
      console.error("Failed to load skills", error);
      setSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  }

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  async function fetchPosts(pageNum = 0, append = false) {
    try {
      setLoadingPosts(true);
      const response = await getMyPosts(pageNum, 10);
      if (response.data?.success) {
        const pageData = response.data.data;
        setPosts((prev) =>
          append ? [...prev, ...pageData.posts] : pageData.posts,
        );
        setHasNext(pageData.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoadingPosts(false);
    }
  }

  // Called after a post is deleted from inside PostCard, so the list
  // reflects the deletion without a full page reload.
  function handlePostDeleted(deletedId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  if (loadingProfile || !profile) {
    return (
      <HomeLayout>
        <div className="profile-page">
          <p className="body-sm" style={{ marginTop: 24 }}>
            Loading profile…
          </p>
        </div>
      </HomeLayout>
    );
  }

  const name = `${profile.firstName} ${profile.lastName}`;
  const locationParts = [profile.city, profile.state, profile.country].filter(
    Boolean,
  );
  const likesReceived = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const commentsReceived = posts.reduce(
    (sum, p) => sum + (p.commentCount || 0),
    0,
  );

  const stats = [
    {
      label: "Posts",
      value: posts.length,
      icon: FileText,
      color: "var(--primary)",
    },
    {
      label: "Likes Received",
      value: likesReceived,
      icon: Heart,
      color: "var(--danger)",
    },
    {
      label: "Comments",
      value: commentsReceived,
      icon: MessageCircle,
      color: "var(--success)",
    },
    {
      label: "Bookmarks",
      value: STATIC_FALLBACK.bookmarksCount,
      icon: Bookmark,
      color: "var(--warning)",
    },
  ];

  return (
    <HomeLayout>
      <div className="profile-page">
        {/* ---------- Cover + avatar ---------- */}
        <div
          className="profile-cover"
          style={{ backgroundImage: `url("${encodeURI(profile.coverImage)}")` }}
        >
          <div className="profile-avatar-wrap">
            <img
              src={profile.profileImage}
              alt={name}
              className="profile-avatar"
            />
            <span className="profile-status-dot" aria-label="Online" />
          </div>
          <button
            className="btn btn-secondary profile-edit-btn"
            onClick={() => navigate("/update-profile")}
          >
            <Pencil size={14} /> Edit Profile
          </button>
        </div>

        {/* ---------- Identity block ---------- */}
        <div className="profile-identity">
          <div
            className="flex-center"
            style={{ justifyContent: "flex-start", gap: 6 }}
          >
            <h1 className="heading-lg" style={{ margin: 0 }}>
              {name}
            </h1>
            {STATIC_FALLBACK.verified && (
              <BadgeCheck size={20} style={{ color: "var(--primary)" }} />
            )}
          </div>
          <p className="body-sm" style={{ marginTop: 2 }}>
            {profile.headline}
          </p>
          <p className="body-md" style={{ marginTop: 10, maxWidth: 560 }}>
            {profile.bio}
          </p>

          <div
            className="flex-center profile-meta-row"
            style={{
              justifyContent: "flex-start",
              gap: 18,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {locationParts.length > 0 && (
              <span className="body-sm profile-meta-item">
                <MapPin size={14} /> {locationParts.join(", ")}
              </span>
            )}
            {profile.githubUrl && (
              <span className="body-sm profile-meta-item">
                <Globe size={14} />{" "}
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand"
                  style={{ textDecoration: "none" }}
                >
                  GitHub
                </a>
              </span>
            )}

            {profile.linkedinUrl && (
              <span className="body-sm profile-meta-item">
                <Link size={14} />{" "}
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand"
                  style={{ textDecoration: "none" }}
                >
                  LinkedIn
                </a>
              </span>
            )}
            <span className="body-sm profile-meta-item">
              <Calendar size={14} /> Joined {STATIC_FALLBACK.joined}
            </span>
          </div>

          {/* ---------- Skills ---------- */}
          {(loadingSkills || skills.length > 0) && (
            <div
              className="flex flex-wrap gap-2"
              style={{ marginTop: 16 }}
            >
              {loadingSkills ? (
                <span className="body-sm">Loading skills…</span>
              ) : (
                skills.map((skill) => (
                  <span key={skill.id} className="badge">
                    {skill.name}
                  </span>
                ))
              )}
            </div>
          )}

          {/* ---------- Profile Stats (moved up from sidebar) ---------- */}
          <div
            className="flex-center profile-stats-row"
            style={{
              justifyContent: "flex-start",
              gap: 24,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <span
                  key={stat.label}
                  className="body-sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  <Icon size={16} style={{ color: stat.color }} />
                  <strong style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </strong>{" "}
                  {stat.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ---------- Main: recent posts ---------- */}
        <section className="profile-grid">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h2 className="heading-md" style={{ margin: 0 }}>
              Recent Posts
            </h2>
            <a
              href="#"
              className="body-sm text-brand"
              style={{ textDecoration: "none" }}
            >
              View all
            </a>
          </div>

          {loadingPosts ? (
            <p className="body-sm">Loading posts…</p>
          ) : posts.length === 0 ? (
            <p className="body-sm">No posts yet.</p>
          ) : (
            <div className="flex-column" style={{ gap: 14 }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showBackButton={false}
                  showEditDelete={true}
                  onDeleted={() => handlePostDeleted(post.id)}
                />
              ))}
            </div>
          )}

          {hasNext && (
            <button
              className="btn btn-outline"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => fetchPosts(page + 1, true)}
            >
              <RotateCw size={14} /> Load more posts
            </button>
          )}
        </section>
      </div>
    </HomeLayout>
  );
}