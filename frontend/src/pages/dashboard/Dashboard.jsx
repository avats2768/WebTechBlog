import { useState } from "react";
import { useSelector } from "react-redux";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Hash, Video, X, Plus } from "lucide-react";

import HomeLayout from "../../layouts/HomeLayout";

// ---- dummy data, swap with real API data later ----
const stories = [
  { id: 1, label: "React", color: "bg-cyan-100 text-cyan-600", members: "145k members" },
  { id: 2, label: "JS", color: "bg-yellow-400 text-white", members: "198k members" },
  { id: 3, label: "Nx", color: "bg-slate-900 text-white", members: "87k members" },
  { id: 4, label: "DevOps", color: "bg-blue-100 text-blue-600", members: "112k members" },
  { id: 5, label: "Py", color: "bg-blue-500 text-white", members: "159k members" },
  { id: 6, label: "TS", color: "bg-sky-500 text-white", members: "101k members" },
];

const posts = [
  {
    id: 1,
    author: "Alex Johnson",
    role: "Senior Developer",
    time: "2h ago",
    title: "Building a Real-time Chat App with Next.js 14, Socket.io & TypeScript",
    description:
      "Learn how to build a production-ready real-time chat application using Next.js 14, Socket.io, TypeScript, and Tailwind CSS. This guide covers authentication, real-time...",
    tags: ["Next.js", "TypeScript", "Socket.io", "Tailwind CSS"],
    likes: 245,
    comments: 32,
    readTime: "5 min read",
  },
  {
    id: 2,
    author: "Sarah Wilson",
    role: "Tech Writer",
    time: "5h ago",
    title: "Understanding System Design: A Beginner's Guide",
    description:
      "System design is an essential skill for any backend developer. In this article, we break down the fundamentals...",
    tags: [],
    likes: 189,
    comments: 27,
    readTime: "8 min read",
  },
];

const trendingTags = [
  { tag: "NextJS", posts: "12.5k posts" },
  { tag: "TypeScript", posts: "8.7k posts" },
  { tag: "WebDev", posts: "7.1k posts" },
  { tag: "SystemDesign", posts: "6.3k posts" },
  { tag: "DevOps", posts: "4.8k posts" },
];

const popularAuthors = [
  { name: "Alex Johnson", handle: "@alexj", followers: "24.5k followers" },
  { name: "Sarah Wilson", handle: "@sarahw", followers: "18.7k followers" },
  { name: "Michael Chen", handle: "@mchen_dev", followers: "15.2k followers" },
];

const communities = [
  { name: "Frontend Masters", members: "124k members" },
  { name: "Backend Brigade", members: "98k members" },
  { name: "DevOps Hub", members: "76k members" },
];

const tabs = ["For you", "Following", "Trending"];

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("For you");
  const [showVideoCard, setShowVideoCard] = useState(true);

  return (
    <HomeLayout>
      <div className="flex gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Welcome banner */}
          <div className="mb-6">
            <h1 className="heading-xl">Welcome back, {user?.username || "John"}! 👋</h1>
            <p className="body-md" style={{ marginTop: 4 }}>
              Discover, share and grow with the tech community.
            </p>
          </div>

          {/* Stories row */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <Plus size={18} style={{ color: "var(--primary)" }} />
              </div>
              <span className="body-sm">Your Story</span>
            </div>
            {stories.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 shrink-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold ${s.color}`}>
                  {s.label}
                </div>
                <span className="body-sm">{s.members}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <article key={post.id} className="card card-hover p-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                      style={{ backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}
                    >
                      {post.author.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{post.author}</p>
                      <p className="body-sm">{post.role} · {post.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bookmark size={17} className="cursor-pointer" style={{ color: "var(--text-secondary)" }} />
                    <MoreHorizontal size={17} className="cursor-pointer" style={{ color: "var(--text-secondary)" }} />
                  </div>
                </div>

                <h2 className="heading-md" style={{ marginBottom: 8 }}>{post.title}</h2>
                <p className="body-md" style={{ marginBottom: 12 }}>{post.description}</p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge"
                        style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1.5">
                      <Heart size={16} style={{ color: "var(--danger)" }} /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle size={16} /> {post.comments}
                    </span>
                  </div>
                  <span className="body-sm">{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Communities you might like */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading-md">Communities You Might Like</h3>
              <button className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>View all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {communities.map((c) => (
                <div key={c.name} className="card flex items-center justify-between p-md">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full" style={{ backgroundColor: "var(--surface)" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                      <p className="body-sm">{c.members}</p>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:flex flex-col gap-6 w-80 shrink-0">
          {/* Trending tags */}
          <div className="card p-lg">
            <h3 className="heading-md" style={{ marginBottom: 16 }}>Trending Tags</h3>
            <div className="flex flex-col gap-3">
              {trendingTags.map((t) => (
                <div key={t.tag} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
                    <Hash size={14} style={{ color: "var(--primary)" }} /> {t.tag}
                  </span>
                  <span className="body-sm">{t.posts}</span>
                </div>
              ))}
            </div>
            <button className="text-sm font-medium hover:underline mt-4" style={{ color: "var(--primary)" }}>
              See all tags
            </button>
          </div>

          {/* Popular authors */}
          <div className="card p-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading-md">Popular Authors</h3>
              <button className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>View all</button>
            </div>
            <div className="flex flex-col gap-4">
              {popularAuthors.map((a) => (
                <div key={a.handle} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs"
                      style={{ backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}
                    >
                      {a.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                      <p className="body-sm">{a.handle} · {a.followers}</p>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Start a video call */}
          {showVideoCard && (
            <div
              className="relative p-5 overflow-hidden"
              style={{ borderRadius: "var(--radius-lg)", backgroundColor: "var(--secondary)", color: "var(--background)" }}
            >
              <button
                onClick={() => setShowVideoCard(false)}
                className="absolute top-3 right-3"
                style={{ color: "var(--background)", opacity: 0.6 }}
              >
                <X size={16} />
              </button>
              <h3 className="text-base font-semibold mb-2">Start a Video Call</h3>
              <p className="text-sm mb-4" style={{ opacity: 0.7 }}>
                Connect face-to-face with your community members.
              </p>
              <div className="flex -space-x-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: "var(--border)", border: "2px solid var(--secondary)" }}
                  />
                ))}
              </div>
              <button className="btn btn-primary w-full">
                <Video size={16} />
                Start Call
              </button>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}