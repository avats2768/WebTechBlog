/* ==========================================================================
   ThemeDemo.jsx

   Place at: src/pages/ThemeDemo.jsx
   Route it however you like, for example with React Router:

      import { ThemeDemo } from "./pages/ThemeDemo";
      <Route path="/theme" element={<ThemeDemo />} />

   This page renders every themed component next to the exact class names
   you need to copy into your own components. Click the copy icon on any
   snippet to copy it.
   ========================================================================== */

import { useState } from "react";
import { Bell, ChevronDown, Trash2, X } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { CodeBlock } from "../components/CodeBlock";

/* A consistent "Preview | Code" row used for every example on this page. */
function Section({ title, description, code, children }) {
  return (
    <div className="form-group" style={{ marginBottom: 40 }}>
      <h3 className="heading-md">{title}</h3>
      {description && <p className="body-sm" style={{ marginTop: 4 }}>{description}</p>}

      <div className="grid-2" style={{ marginTop: 16, alignItems: "start" }}>
        <div className="card p-lg flex-center" style={{ minHeight: 120 }}>
          {children}
        </div>
        <CodeBlock code={code} />
      </div>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="heading-lg" style={{ marginTop: 56, marginBottom: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
      {children}
    </h2>
  );
}

export function ThemeDemo() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activePage, setActivePage] = useState(2);
  const [toastVisible, setToastVisible] = useState(false);

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <div className="bg-background" style={{ minHeight: "100vh" }}>
      {/* ---------- Page header ---------- */}
      <header className="flex-between p-md border-default" style={{ borderTop: "none", borderLeft: "none", borderRight: "none", position: "sticky", top: 0, backgroundColor: "var(--background)", zIndex: 30 }}>
        <div>
          <h1 className="heading-lg">Theme System</h1>
          <p className="body-sm">Copy any snippet below into your components</p>
        </div>
        <ThemeToggle />
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 96px" }}>

        {/* ================= BUTTONS ================= */}
        <SectionHeading>Buttons</SectionHeading>

        <Section
          title="Button variants"
          description="Use .btn together with one variant class."
          code={
`<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-ghost">Ghost</button>`
          }
        >
          <div className="flex-center" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-outline">Outline</button>
            <button className="btn btn-ghost">Ghost</button>
          </div>
        </Section>

        <Section
          title="Icon button"
          description="Use .btn-icon for square, icon-only buttons."
          code={`<button className="btn btn-outline btn-icon">\n  <Trash2 size={16} />\n</button>`}
        >
          <button className="btn btn-outline btn-icon">
            <Trash2 size={16} />
          </button>
        </Section>

        {/* ================= FORMS ================= */}
        <SectionHeading>Inputs &amp; Forms</SectionHeading>

        <Section
          title="Form field"
          description="Group label, input, and helper/error text with .form-group."
          code={
`<div className="form-group">
  <label className="form-label">Email</label>
  <input className="input" placeholder="you@example.com" />
  <span className="form-helper">We'll never share your email.</span>
</div>

<div className="form-group">
  <label className="form-label">Password</label>
  <input className="input input-error" type="password" />
  <span className="form-error">Password must be at least 8 characters.</span>
</div>`
          }
        >
          <div style={{ width: "100%" }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" placeholder="you@example.com" />
              <span className="form-helper">We'll never share your email.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input input-error" type="password" />
              <span className="form-error">Password must be at least 8 characters.</span>
            </div>
          </div>
        </Section>

        {/* ================= CARDS ================= */}
        <SectionHeading>Cards</SectionHeading>

        <Section
          title="Card with header, content, footer"
          description="Add .card-hover for a lift effect on hover."
          code={
`<div className="card card-hover">
  <div className="card-header">Deploy preview</div>
  <div className="card-content">
    Your latest commit is ready to deploy.
  </div>
  <div className="card-footer flex-between">
    <span className="badge badge-success">Ready</span>
    <button className="btn btn-primary">Deploy</button>
  </div>
</div>`
          }
        >
          <div className="card card-hover" style={{ width: "100%" }}>
            <div className="card-header">Deploy preview</div>
            <div className="card-content">Your latest commit is ready to deploy.</div>
            <div className="card-footer flex-between">
              <span className="badge badge-success">Ready</span>
              <button className="btn btn-primary">Deploy</button>
            </div>
          </div>
        </Section>

        {/* ================= BADGES ================= */}
        <SectionHeading>Badges</SectionHeading>

        <Section
          title="Status badges"
          code={
`<span className="badge">Default</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>`
          }
        >
          <div className="flex-center" style={{ gap: 8 }}>
            <span className="badge">Default</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-danger">Danger</span>
          </div>
        </Section>

        {/* ================= ALERTS ================= */}
        <SectionHeading>Alerts</SectionHeading>

        <Section
          title="Inline alerts"
          code={
`<div className="alert alert-success">Changes saved successfully.</div>
<div className="alert alert-warning">Your plan expires in 3 days.</div>
<div className="alert alert-danger">Failed to connect to the server.</div>`
          }
        >
          <div className="flex-column" style={{ gap: 10, width: "100%" }}>
            <div className="alert alert-success">Changes saved successfully.</div>
            <div className="alert alert-warning">Your plan expires in 3 days.</div>
            <div className="alert alert-danger">Failed to connect to the server.</div>
          </div>
        </Section>

        {/* ================= TOAST ================= */}
        <SectionHeading>Toast</SectionHeading>

        <Section
          title="Toast notification"
          description="Click the button to trigger a real toast, fixed to the bottom-right of the screen."
          code={
`function showToast() {
  setVisible(true);
  setTimeout(() => setVisible(false), 2500);
}

{visible && (
  <div className="toast toast-success">
    Changes saved.
  </div>
)}`
          }
        >
          <button className="btn btn-primary" onClick={showToast}>
            Trigger toast
          </button>

          {toastVisible && (
            <div
              className="toast toast-success"
              style={{ position: "fixed", bottom: 24, right: 24, zIndex: 60 }}
            >
              Changes saved.
            </div>
          )}
        </Section>

        {/* ================= TABS ================= */}
        <SectionHeading>Tabs</SectionHeading>

        <Section
          title="Tabs"
          code={
`<div className="tabs">
  <button className={\`tab \${active === "overview" ? "tab-active" : ""}\`}>
    Overview
  </button>
  <button className={\`tab \${active === "activity" ? "tab-active" : ""}\`}>
    Activity
  </button>
</div>`
          }
        >
          <div className="tabs" style={{ width: "100%" }}>
            {["overview", "activity", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </Section>

        {/* ================= PAGINATION ================= */}
        <SectionHeading>Pagination</SectionHeading>

        <Section
          title="Pagination"
          code={
`<div className="pagination">
  <button className="pagination-item">‹</button>
  <button className="pagination-item pagination-active">2</button>
  <button className="pagination-item">3</button>
  <button className="pagination-item">›</button>
</div>`
          }
        >
          <div className="pagination">
            <button className="pagination-item" onClick={() => setActivePage((p) => Math.max(1, p - 1))}>‹</button>
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`pagination-item ${activePage === page ? "pagination-active" : ""}`}
              >
                {page}
              </button>
            ))}
            <button className="pagination-item" onClick={() => setActivePage((p) => Math.min(4, p + 1))}>›</button>
          </div>
        </Section>

        {/* ================= TABLE ================= */}
        <SectionHeading>Table</SectionHeading>

        <Section
          title="Striped, hoverable table"
          code={
`<div className="table-responsive">
  <table className="table table-striped table-hover">
    <thead>
      <tr><th>Repository</th><th>Visibility</th></tr>
    </thead>
    <tbody>
      <tr><td>theme-system</td><td>Public</td></tr>
      <tr><td>blog-api</td><td>Private</td></tr>
    </tbody>
  </table>
</div>`
          }
        >
          <div className="table-responsive" style={{ width: "100%" }}>
            <table className="table table-striped table-hover">
              <thead>
                <tr><th>Repository</th><th>Visibility</th></tr>
              </thead>
              <tbody>
                <tr><td>theme-system</td><td>Public</td></tr>
                <tr><td>blog-api</td><td>Private</td></tr>
                <tr><td>ui-kit</td><td>Public</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ================= LIST ================= */}
        <SectionHeading>List</SectionHeading>

        <Section
          title="Hoverable list"
          code={
`<div className="list border-default" style={{ borderRadius: "var(--radius-md)" }}>
  <div className="list-item list-hover">Notifications</div>
  <div className="list-item list-hover">Privacy</div>
  <div className="list-item list-hover">Billing</div>
</div>`
          }
        >
          <div className="list border-default" style={{ width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <div className="list-item list-hover">Notifications</div>
            <div className="list-item list-hover">Privacy</div>
            <div className="list-item list-hover">Billing</div>
          </div>
        </Section>

        {/* ================= DROPDOWN ================= */}
        <SectionHeading>Dropdown</SectionHeading>

        <Section
          title="Dropdown menu"
          code={
`<div className="dropdown">
  <button className="btn btn-outline" onClick={() => setOpen(!open)}>
    Options <ChevronDown size={14} />
  </button>
  {open && (
    <div className="dropdown-menu">
      <button className="dropdown-item">Edit</button>
      <button className="dropdown-item">Duplicate</button>
      <button className="dropdown-item text-danger">Delete</button>
    </div>
  )}
</div>`
          }
        >
          <div className="dropdown">
            <button className="btn btn-outline" onClick={() => setDropdownOpen((v) => !v)}>
              Options <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Edit</button>
                <button className="dropdown-item">Duplicate</button>
                <button className="dropdown-item text-danger">Delete</button>
              </div>
            )}
          </div>
        </Section>

        {/* ================= MODAL ================= */}
        <SectionHeading>Modal</SectionHeading>

        <Section
          title="Modal dialog"
          description="Click to open a real, full-screen modal."
          code={
`<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      Delete repository
      <button className="btn btn-ghost btn-icon" onClick={close}><X size={16} /></button>
    </div>
    <div className="modal-body">
      This action cannot be undone.
    </div>
    <div className="modal-footer">
      <button className="btn btn-ghost" onClick={close}>Cancel</button>
      <button className="btn btn-danger">Delete</button>
    </div>
  </div>
</div>`
          }
        >
          <button className="btn btn-danger" onClick={() => setModalOpen(true)}>
            Open modal
          </button>

          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  Delete repository
                  <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body">
                  This action cannot be undone. This will permanently delete the repository.
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => setModalOpen(false)}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ================= DRAWER ================= */}
        <SectionHeading>Drawer</SectionHeading>

        <Section
          title="Side drawer"
          description="Click to slide in a real drawer from the right."
          code={
`<div className="drawer drawer-right">
  <div className="modal-header">
    Notifications
    <button className="btn btn-ghost btn-icon" onClick={close}><X size={16} /></button>
  </div>
  <div className="modal-body">...</div>
</div>`
          }
        >
          <button className="btn btn-outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </button>

          {drawerOpen && (
            <>
              <div className="modal-overlay" style={{ backgroundColor: "rgb(0 0 0 / 0.3)" }} onClick={() => setDrawerOpen(false)} />
              <div className="drawer drawer-right">
                <div className="modal-header">
                  Notifications
                  <button className="btn btn-ghost btn-icon" onClick={() => setDrawerOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body flex-column" style={{ gap: 12 }}>
                  <div className="alert"><Bell size={16} /> New comment on your post</div>
                  <div className="alert"><Bell size={16} /> Someone followed you</div>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ================= NAVBAR LINKS ================= */}
        <SectionHeading>Navbar Links</SectionHeading>

        <Section
          title="Nav links"
          code={
`<a className="nav-link">Home</a>
<a className="nav-link nav-link-active">Explore</a>
<a className="nav-link">Settings</a>`
          }
        >
          <nav className="flex-center" style={{ gap: 4 }}>
            <a className="nav-link" href="#">Home</a>
            <a className="nav-link nav-link-active" href="#">Explore</a>
            <a className="nav-link" href="#">Settings</a>
          </nav>
        </Section>

      </main>
    </div>
  );
}