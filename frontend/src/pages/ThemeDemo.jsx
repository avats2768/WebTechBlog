/* ==========================================================================
   ThemeDemo.jsx

   Place at: src/pages/ThemeDemo.jsx

   This page renders every themed component next to the exact class names
   / hooks you need to copy into your own components. Click the copy icon
   on any snippet to copy it.
   ========================================================================== */

import { useState } from "react";
import { Bell, ChevronDown, Trash2, X, Inbox, Mail } from "lucide-react";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { CodeBlock } from "../components/common/CodeBlock";
import { Tooltip } from "../components/common/Tooltip";

import { Switch, Checkbox, Radio } from "../components/common/FormControls";
import { Spinner, Skeleton } from "../components/common/Loader";
import { EmptyState } from "../components/common/EmptyState";
import { useConfirm } from "../context/ConfirmContext";
import { useToast } from "../context/ToastContext";

/* A consistent "Preview | Code" row used for every example on this page. */
function Section({ title, description, code, children }) {
  return (
    <div className="form-group" style={{ marginBottom: 40 }}>
      <h3 className="heading-md">{title}</h3>
      {description && (
        <p className="body-sm" style={{ marginTop: 4 }}>
          {description}
        </p>
      )}

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
    <h2
      className="heading-lg"
      style={{
        marginTop: 56,
        marginBottom: 8,
        borderBottom: "1px solid var(--border)",
        paddingBottom: 12,
      }}
    >
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

  // New: form control demo state
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("monthly");

  // New: confirm dialog + toast hooks
  const confirm = useConfirm();
  const toast = useToast();

  async function handleConfirmDemo() {
    const ok = await confirm({
      title: "Delete repository",
      message:
        "This action cannot be undone. This will permanently delete the repository.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (ok) {
      toast.success("Repository deleted.");
    }
  }

  async function handleConfirmAsyncDemo() {
    const ok = await confirm({
      title: "Publish changes",
      message: "This will make your changes live immediately.",
      confirmLabel: "Publish",
      variant: "info",
      handler: async () => {
        await new Promise((res) => setTimeout(res, 1500)); // simulate API call
      },
    });
    if (ok) toast.success("Published successfully.");
  }

  return (
    <div className="bg-background" style={{ minHeight: "100vh" }}>
      {/* ---------- Page header ---------- */}
      <header
        className="flex-between p-md border-default"
        style={{
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--background)",
          zIndex: 30,
        }}
      >
        <div>
          <h1 className="heading-lg">Theme System</h1>
          <p className="body-sm">Copy any snippet below into your components</p>
        </div>
        <ThemeToggle />
      </header>

      <main
        style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 96px" }}
      >
        {/* ================= BUTTONS ================= */}
        <SectionHeading>Buttons</SectionHeading>

        <Section
          title="Button variants"
          description="Use .btn together with one variant class."
          code={`<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-ghost">Ghost</button>`}
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
          code={`<div className="form-group">
  <label className="form-label">Email</label>
  <input className="input" placeholder="you@example.com" />
  <span className="form-helper">We'll never share your email.</span>
</div>

<div className="form-group">
  <label className="form-label">Password</label>
  <input className="input input-error" type="password" />
  <span className="form-error">Password must be at least 8 characters.</span>
</div>`}
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
              <span className="form-error">
                Password must be at least 8 characters.
              </span>
            </div>
          </div>
        </Section>

        {/* ================= SWITCH / CHECKBOX / RADIO ================= */}
        <Section
          title="Switch, checkbox, radio"
          description="Controlled components from FormControls.jsx — pass checked + onChange."
          code={`import { Switch, Checkbox, Radio } from "../components/FormControls";

<Switch checked={switchOn} onChange={setSwitchOn} label="Email notifications" />

<Checkbox checked={checked} onChange={setChecked} label="I agree to the terms" />

<Radio name="plan" value="monthly" checked={radioValue === "monthly"}
  onChange={() => setRadioValue("monthly")} label="Monthly" />
<Radio name="plan" value="yearly" checked={radioValue === "yearly"}
  onChange={() => setRadioValue("yearly")} label="Yearly" />`}
        >
          <div
            className="flex-column"
            style={{ gap: 16, alignItems: "flex-start" }}
          >
            <Switch
              checked={switchOn}
              onChange={setSwitchOn}
              label="Email notifications"
            />
            <Checkbox
              checked={checked}
              onChange={setChecked}
              label="I agree to the terms"
            />
            <div className="flex-center" style={{ gap: 16 }}>
              <Radio
                name="plan"
                value="monthly"
                checked={radioValue === "monthly"}
                onChange={() => setRadioValue("monthly")}
                label="Monthly"
              />
              <Radio
                name="plan"
                value="yearly"
                checked={radioValue === "yearly"}
                onChange={() => setRadioValue("yearly")}
                label="Yearly"
              />
            </div>
          </div>
        </Section>

        {/* ================= CARDS ================= */}
        <SectionHeading>Cards</SectionHeading>

        <Section
          title="Card with header, content, footer"
          description="Add .card-hover for a lift effect on hover."
          code={`<div className="card card-hover">
  <div className="card-header">Deploy preview</div>
  <div className="card-content">
    Your latest commit is ready to deploy.
  </div>
  <div className="card-footer flex-between">
    <span className="badge badge-success">Ready</span>
    <button className="btn btn-primary">Deploy</button>
  </div>
</div>`}
        >
          <div className="card card-hover" style={{ width: "100%" }}>
            <div className="card-header">Deploy preview</div>
            <div className="card-content">
              Your latest commit is ready to deploy.
            </div>
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
          code={`<span className="badge">Default</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>`}
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
          code={`<div className="alert alert-success">Changes saved successfully.</div>
<div className="alert alert-warning">Your plan expires in 3 days.</div>
<div className="alert alert-danger">Failed to connect to the server.</div>`}
        >
          <div className="flex-column" style={{ gap: 10, width: "100%" }}>
            <div className="alert alert-success">
              Changes saved successfully.
            </div>
            <div className="alert alert-warning">
              Your plan expires in 3 days.
            </div>
            <div className="alert alert-danger">
              Failed to connect to the server.
            </div>
          </div>
        </Section>

        {/* ================= TOAST ================= */}
        <SectionHeading>Toast</SectionHeading>

        <Section
          title="Toast notification"
          description="useToast() — no local state needed, mount ToastProvider once in main.jsx."
          code={`import { useToast } from "../context/ToastContext";

const toast = useToast();

toast.success("Changes saved.");
toast.error("Something went wrong.");
toast.info("Heads up — this is just info.");`}
        >
          <div className="flex-center" style={{ gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-success"
              onClick={() => toast.success("Changes saved.")}
            >
              Success toast
            </button>
            <button
              className="btn btn-danger"
              onClick={() => toast.error("Something went wrong.")}
            >
              Error toast
            </button>
            <button
              className="btn btn-outline"
              onClick={() => toast.info("Heads up — this is just info.")}
            >
              Info toast
            </button>
          </div>
        </Section>

        {/* ================= TOOLTIP ================= */}
        <SectionHeading>Tooltip</SectionHeading>

        <Section
          title="Tooltip"
          description="Wrap any element. Works on hover and keyboard focus."
          code={`import { Tooltip } from "../components/Tooltip";

<Tooltip content="Delete this item" side="top">
  <button className="btn btn-outline btn-icon">
    <Trash2 size={16} />
  </button>
</Tooltip>`}
        >
          <div className="flex-center" style={{ gap: 24 }}>
            <Tooltip content="Delete this item" side="top">
              <button className="btn btn-outline btn-icon">
                <Trash2 size={16} />
              </button>
            </Tooltip>
            <Tooltip content="You have 3 unread messages" side="bottom">
              <button className="btn btn-outline btn-icon">
                <Mail size={16} />
              </button>
            </Tooltip>
          </div>
        </Section>

        {/* ================= SPINNER / SKELETON ================= */}
        <SectionHeading>Loading states</SectionHeading>

        <Section
          title="Spinner"
          description="Drop into a button while an action is pending."
          code={`import { Spinner } from "../components/Loaders";

<Spinner />
<Spinner size={24} />

<button className="btn btn-primary" disabled={loading}>
  {loading ? <Spinner size={16} /> : "Save"}
</button>`}
        >
          <div className="flex-center" style={{ gap: 20 }}>
            <Spinner size={16} />
            <Spinner size={24} />
            <button className="btn btn-primary" disabled>
              <Spinner size={16} /> Saving…
            </button>
          </div>
        </Section>

        <Section
          title="Skeleton loader"
          description="Use while content is loading, e.g. for a list or card row."
          code={`import { Skeleton } from "../components/Loaders";

<Skeleton width={48} height={48} circle />
<Skeleton width="60%" height={16} />
<Skeleton width="40%" height={16} />`}
        >
          <div className="flex-center" style={{ gap: 12, width: "100%" }}>
            <Skeleton width={48} height={48} circle />
            <div className="flex-column" style={{ gap: 8, flex: 1 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="40%" height={14} />
            </div>
          </div>
        </Section>

        {/* ================= EMPTY STATE ================= */}
        <SectionHeading>Empty state</SectionHeading>

        <Section
          title="Empty state"
          description="For tables or lists with no data yet."
          code={`import { EmptyState } from "../components/EmptyState";
import { Inbox } from "lucide-react";

<EmptyState
  icon={Inbox}
  title="No notifications yet"
  description="When something happens, you'll see it here."
  action={<button className="btn btn-primary">Refresh</button>}
/>`}
        >
          <EmptyState
            icon={Inbox}
            title="No notifications yet"
            description="When something happens, you'll see it here."
            action={<button className="btn btn-primary">Refresh</button>}
          />
        </Section>

        {/* ================= CONFIRM DIALOG ================= */}
        <SectionHeading>Confirm dialog</SectionHeading>

        <Section
          title="Basic confirm"
          description="useConfirm() returns a Promise<boolean>. Mount ConfirmProvider once in main.jsx."
          code={`import { useConfirm } from "../context/ConfirmContext";

const confirm = useConfirm();

async function handleDelete() {
  const ok = await confirm({
    title: "Delete repository",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
    variant: "danger",
  });
  if (ok) deleteRepo();
}`}
        >
          <button className="btn btn-danger" onClick={handleConfirmDemo}>
            Delete repository
          </button>
        </Section>

        <Section
          title="Async confirm (built-in loading state)"
          description="Pass an async `handler` — the dialog shows 'Please wait…' itself, no local loading state needed."
          code={`const ok = await confirm({
  title: "Publish changes",
  message: "This will make your changes live immediately.",
  confirmLabel: "Publish",
  variant: "info",
  handler: async () => {
    await api.publish();
  },
});
if (ok) toast.success("Published successfully.");`}
        >
          <button className="btn btn-primary" onClick={handleConfirmAsyncDemo}>
            Publish changes
          </button>
        </Section>

        {/* ================= TABS ================= */}
        <SectionHeading>Tabs</SectionHeading>

        <Section
          title="Tabs"
          code={`<div className="tabs">
  <button className={\`tab \${active === "overview" ? "tab-active" : ""}\`}>
    Overview
  </button>
  <button className={\`tab \${active === "activity" ? "tab-active" : ""}\`}>
    Activity
  </button>
</div>`}
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
          code={`<div className="pagination">
  <button className="pagination-item">‹</button>
  <button className="pagination-item pagination-active">2</button>
  <button className="pagination-item">3</button>
  <button className="pagination-item">›</button>
</div>`}
        >
          <div className="pagination">
            <button
              className="pagination-item"
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`pagination-item ${activePage === page ? "pagination-active" : ""}`}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-item"
              onClick={() => setActivePage((p) => Math.min(4, p + 1))}
            >
              ›
            </button>
          </div>
        </Section>

        {/* ================= TABLE ================= */}
        <SectionHeading>Table</SectionHeading>

        <Section
          title="Striped, hoverable table"
          code={`<div className="table-responsive">
  <table className="table table-striped table-hover">
    <thead>
      <tr><th>Repository</th><th>Visibility</th></tr>
    </thead>
    <tbody>
      <tr><td>theme-system</td><td>Public</td></tr>
      <tr><td>blog-api</td><td>Private</td></tr>
    </tbody>
  </table>
</div>`}
        >
          <div className="table-responsive" style={{ width: "100%" }}>
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Repository</th>
                  <th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>theme-system</td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>blog-api</td>
                  <td>Private</td>
                </tr>
                <tr>
                  <td>ui-kit</td>
                  <td>Public</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ================= LIST ================= */}
        <SectionHeading>List</SectionHeading>

        <Section
          title="Hoverable list"
          code={`<div className="list border-default" style={{ borderRadius: "var(--radius-md)" }}>
  <div className="list-item list-hover">Notifications</div>
  <div className="list-item list-hover">Privacy</div>
  <div className="list-item list-hover">Billing</div>
</div>`}
        >
          <div
            className="list border-default"
            style={{
              width: "100%",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div className="list-item list-hover">Notifications</div>
            <div className="list-item list-hover">Privacy</div>
            <div className="list-item list-hover">Billing</div>
          </div>
        </Section>

        {/* ================= DROPDOWN ================= */}
        <SectionHeading>Dropdown</SectionHeading>

        <Section
          title="Dropdown menu"
          code={`<div className="dropdown">
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
</div>`}
        >
          <div className="dropdown">
            <button
              className="btn btn-outline"
              onClick={() => setDropdownOpen((v) => !v)}
            >
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
          code={`<div className="modal-overlay">
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
</div>`}
        >
          <button className="btn btn-danger" onClick={() => setModalOpen(true)}>
            Open modal
          </button>

          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  Delete repository
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setModalOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body">
                  This action cannot be undone. This will permanently delete the
                  repository.
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setModalOpen(false)}
                  >
                    Delete
                  </button>
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
          code={`<div className="drawer drawer-right">
  <div className="modal-header">
    Notifications
    <button className="btn btn-ghost btn-icon" onClick={close}><X size={16} /></button>
  </div>
  <div className="modal-body">...</div>
</div>`}
        >
          <button
            className="btn btn-outline"
            onClick={() => setDrawerOpen(true)}
          >
            Open drawer
          </button>

          {drawerOpen && (
            <>
              <div
                className="modal-overlay"
                style={{ backgroundColor: "rgb(0 0 0 / 0.3)" }}
                onClick={() => setDrawerOpen(false)}
              />
              <div className="drawer drawer-right">
                <div className="modal-header">
                  Notifications
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body flex-column" style={{ gap: 12 }}>
                  <div className="alert">
                    <Bell size={16} /> New comment on your post
                  </div>
                  <div className="alert">
                    <Bell size={16} /> Someone followed you
                  </div>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ================= NAVBAR LINKS ================= */}
        <SectionHeading>Navbar Links</SectionHeading>

        <Section
          title="Nav links"
          code={`<a className="nav-link">Home</a>
<a className="nav-link nav-link-active">Explore</a>
<a className="nav-link">Settings</a>`}
        >
          <nav className="flex-center" style={{ gap: 4 }}>
            <a className="nav-link" href="#">
              Home
            </a>
            <a className="nav-link nav-link-active" href="#">
              Explore
            </a>
            <a className="nav-link" href="#">
              Settings
            </a>
          </nav>
        </Section>
      </main>
    </div>
  );
}
