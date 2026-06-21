import { useState, useEffect } from "react";
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
  User,
  RotateCw,
  LayoutGrid,
} from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { getPostByUser } from "../../api/postsApi";
import { getProfile } from "../../api/userApi";
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
  following: 256,
  followers: "1.2K",
  aboutTags: ["Open Source Contributor", "Tech Blogger", "Lifelong Learner"],
  skills: [
    { name: "Java", percent: 90, color: "var(--primary)" },
    { name: "Spring Boot", percent: 85, color: "var(--success)" },
    { name: "React", percent: 80, color: "var(--info)" },
    { name: "JavaScript", percent: 75, color: "var(--warning)" },
    { name: "MySQL", percent: 70, color: "#3b82f6" },
    { name: "Git", percent: 65, color: "var(--danger)" },
  ],
  communities: [
    { name: "Java Developers", members: "12.5K members", emoji: "☕" },
    { name: "React Developers", members: "8.3K members", emoji: "⚛️" },
    { name: "Spring Boot", members: "6.7K members", emoji: "🌱" },
  ],
  bookmarksCount: 56,
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "about", label: "About", icon: User },
];

function SkillBar({ name, percent, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <span className="body-sm" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{name}</span>
        <span className="body-sm">{percent}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, []); // run once on mount — the missing [] here was causing an infinite loop

  async function fetchProfile() {
    try {
      setLoadingProfile(true);
      const response = await getProfile();
      if (response.data?.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function fetchPosts() {
    try {
      setLoadingPosts(true);
      const response = await getPostByUser();
      if (response.data?.success) {
        setPosts(response.data.data);
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
          <p className="body-sm" style={{ marginTop: 24 }}>Loading profile…</p>
        </div>
      </HomeLayout>
    );
  }

  const name = `${profile.firstName} ${profile.lastName}`;
  const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
  const likesReceived = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const commentsReceived = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

  const stats = [
    { label: "Posts", value: posts.length, icon: FileText, color: "var(--primary)" },
    { label: "Likes Received", value: likesReceived, icon: Heart, color: "var(--danger)" },
    { label: "Comments", value: commentsReceived, icon: MessageCircle, color: "var(--success)" },
    { label: "Bookmarks", value: STATIC_FALLBACK.bookmarksCount, icon: Bookmark, color: "var(--warning)" },
  ];

  return (
    <HomeLayout>
      <div className="profile-page">
        {/* ---------- Cover + avatar ---------- */}
        <div
          className="profile-cover"
          style={{ backgroundImage: `url(${profile.coverImage})` }}
        >
          <div className="profile-avatar-wrap">
            <img
              src={profile.profileImage}
              alt={name}
              className="profile-avatar"
            />
            <span className="profile-status-dot" aria-label="Online" />
          </div>
          <button className="btn btn-secondary profile-edit-btn"
            onClick={() => navigate('/update-profile')}
          >
            <Pencil size={14} /> Edit Profile
          </button>
        </div>

        {/* ---------- Identity block ---------- */}
        <div className="profile-identity">
          <div className="flex-center" style={{ justifyContent: "flex-start", gap: 6 }}>
            <h1 className="heading-lg" style={{ margin: 0 }}>{name}</h1>
            {STATIC_FALLBACK.verified && <BadgeCheck size={20} style={{ color: "var(--primary)" }} />}
          </div>
          <p className="body-sm" style={{ marginTop: 2 }}>{profile.headline}</p>
          <p className="body-md" style={{ marginTop: 10, maxWidth: 560 }}>{profile.bio}</p>

          <div className="flex-center profile-meta-row" style={{ justifyContent: "flex-start", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
            {locationParts.length > 0 && (
              <span className="body-sm profile-meta-item"><MapPin size={14} /> {locationParts.join(", ")}</span>
            )}
            {profile.githubUrl && (
              <span className="body-sm profile-meta-item">
                <Globe size={14} />{" "}
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-brand" style={{ textDecoration: "none" }}>
                  GitHub
                </a>
              </span>
            )}
            
            {profile.linkedinUrl && (
              <span className="body-sm profile-meta-item">
                <Link size={14} />{" "}
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand" style={{ textDecoration: "none" }}>
                  LinkedIn
                </a>
              </span>
            )}
            <span className="body-sm profile-meta-item"><Calendar size={14} /> Joined {STATIC_FALLBACK.joined}</span>
          </div>
          

          <div className="flex-center" style={{ justifyContent: "flex-start", gap: 20, marginTop: 14 }}>
            <span className="body-sm"><strong style={{ color: "var(--text-primary)" }}>{STATIC_FALLBACK.following}</strong> Following</span>
            <span className="body-sm"><strong style={{ color: "var(--text-primary)" }}>{STATIC_FALLBACK.followers}</strong> Followers</span>
          </div>

          {/* ---------- Tabs ---------- */}
          <div className="tabs" style={{ marginTop: 20 }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Main grid: posts + sidebar ---------- */}
        <div className="profile-grid">
          {/* Left: recent posts */}
          <section>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h2 className="heading-md" style={{ margin: 0 }}>Recent Posts</h2>
              <a href="#" className="body-sm text-brand" style={{ textDecoration: "none" }}>View all</a>
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
                    onDeleted={() => handlePostDeleted(post.id)}
                  />
                ))}
              </div>
            )}

            <button className="btn btn-outline" style={{ width: "100%", marginTop: 16 }}>
              <RotateCw size={14} /> Load more posts
            </button>
          </section>

          {/* Right: sidebar */}
          <aside className="flex-column" style={{ gap: 20 }}>
            <div className="card p-lg">
              <h3 className="heading-md" style={{ marginBottom: 10 }}>About Me</h3>
              <p className="body-sm" style={{ marginBottom: 14 }}>{profile.bio}</p>
              <div className="flex-column" style={{ gap: 10 }}>
                <span className="body-sm" style={{ color: "var(--text-primary)" }}>
                  • {profile.designation} at {profile.company}
                </span>
                {STATIC_FALLBACK.aboutTags.map((tag) => (
                  <span key={tag} className="body-sm" style={{ color: "var(--text-primary)" }}>
                    • {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-lg">
              <h3 className="heading-md" style={{ marginBottom: 14 }}>Profile Stats</h3>
              <div className="flex-column" style={{ gap: 12 }}>
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex-between">
                      <span className="body-sm" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                        <Icon size={15} style={{ color: stat.color }} /> {stat.label}
                      </span>
                      <span className="body-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-lg">
              <h3 className="heading-md" style={{ marginBottom: 14 }}>Skills</h3>
              {STATIC_FALLBACK.skills.map((skill) => (
                <SkillBar key={skill.name} {...skill} />
              ))}
            </div>

            <div className="card p-lg">
              <h3 className="heading-md" style={{ marginBottom: 14 }}>Top Communities</h3>
              <div className="flex-column" style={{ gap: 14 }}>
                {STATIC_FALLBACK.communities.map((community) => (
                  <div key={community.name} className="flex-center" style={{ justifyContent: "flex-start", gap: 10 }}>
                    <span className="community-emoji">{community.emoji}</span>
                    <div>
                      <p className="body-sm" style={{ color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>{community.name}</p>
                      <p className="body-sm" style={{ margin: 0 }}>{community.members}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="body-sm text-brand" style={{ textDecoration: "none", display: "inline-block", marginTop: 14 }}>
                View all communities
              </a>
            </div>
          </aside>
        </div>
      </div>
    </HomeLayout>
  );
}