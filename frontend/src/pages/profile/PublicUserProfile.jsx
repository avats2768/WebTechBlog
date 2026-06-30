import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  BadgeCheck,
  Heart,
  MessageCircle,
  FileText,
  RotateCw,
  Globe,
  Link,
  Phone,
  MessageSquare,
} from "lucide-react";
import HomeLayout from "../../layouts/HomeLayout";
import { getUserProfile } from "../../api/userApi";
import { getUserPosts } from "../../api/postsApi";
import PostCard from "../../components/PostCard";

export default function PublicProfilePage() {
  const { uuid } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [uuid]);

  async function fetchProfile() {
    try {
      setLoadingProfile(true);
      const response = await getUserProfile(uuid);
      if (response?.success) {
        setProfile(response.data);
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
      const response = await getUserPosts(uuid);
      if (response.data?.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoadingPosts(false);
    }
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
  ];

  return (
    <HomeLayout>
      <div className="profile-page">
        {/* ---------- Cover + avatar ---------- */}
        <div
          className="profile-cover"
          style={{
            backgroundImage: profile.coverImage
              ? `url("${encodeURI(profile.coverImage)}")`
              : undefined,
            backgroundColor: !profile.coverImage
              ? "var(--surface-secondary)"
              : undefined,
          }}
        >
          <div className="profile-avatar-wrap">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={name}
                className="profile-avatar"
              />
            ) : (
              <div
                className="profile-avatar flex-center"
                style={{
                  background: "var(--surface)",
                  fontWeight: 700,
                  fontSize: 24,
                }}
              >
                {(profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")}
              </div>
            )}
          </div>

          <div className="profile-edit-btn" style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" type="button">
              <MessageSquare size={14} /> Message
            </button>
            <button className="btn btn-success" type="button">
              <Phone size={14} /> Call
            </button>
          </div>
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
            <BadgeCheck size={20} style={{ color: "var(--primary)" }} />
          </div>

          {profile.headline && (
            <p className="body-sm" style={{ marginTop: 2 }}>
              {profile.headline}
            </p>
          )}

          {profile.bio && (
            <p className="body-md" style={{ marginTop: 10, maxWidth: 560 }}>
              {profile.bio}
            </p>
          )}

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
          </div>

          {/* ---------- Stats ---------- */}
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
                  }}
                >
                  <Icon size={16} style={{ color: stat.color }} />
                  <strong>{stat.value}</strong> {stat.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ---------- Posts ---------- */}
        <section className="profile-grid">
          <h2 className="heading-md" style={{ marginBottom: 14 }}>
            Recent Posts
          </h2>

          {loadingPosts ? (
            <p className="body-sm">Loading posts…</p>
          ) : posts.length === 0 ? (
            <p className="body-sm">{name} hasn't shared anything yet.</p>
          ) : (
            <div className="flex-column" style={{ gap: 14 }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showBackButton={false}
                  showEditDelete={false}
                />
              ))}
            </div>
          )}

          <button
            className="btn btn-outline"
            style={{ width: "100%", marginTop: 16 }}
          >
            <RotateCw size={14} /> Load more posts
          </button>
        </section>
      </div>
    </HomeLayout>
  );
}
