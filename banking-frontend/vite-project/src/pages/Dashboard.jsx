import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Overview from "./Overview";
import AccountsPage from "./AccountsPage";
import TransactionsPage from "./TransactionsPage";
import TransferPage from "./TransferPage";
import UsersPage from "./UsersPage";
import ProfilePage from "./ProfilePage";

const NAV_ITEMS = [
  { id: "overview",      icon: "◈", label: "Overview",      section: "main"     },
  { id: "accounts",      icon: "⬡", label: "Accounts",      section: "main"     },
  { id: "transactions",  icon: "↕", label: "Transactions",  section: "main"     },
  { id: "transfer",      icon: "⇄", label: "Transfer",      section: "main"     },
  { id: "users",         icon: "◉", label: "Manage Users",  section: "admin"    },
  { id: "profile",       icon: "⊙", label: "Profile",       section: "settings" },
];

const PAGE_MAP = {
  overview: Overview,
  accounts: AccountsPage,
  transactions: TransactionsPage,
  transfer: TransferPage,
  users: UsersPage,
  profile: ProfilePage,
};

const SECTION_LABELS = { main: "Banking", admin: "Administration", settings: "Settings" };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (user?.name || user?.email || "U")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const ActivePage = PAGE_MAP[activePage] || Overview;

  const navigate = (page) => { setActivePage(page); setSidebarOpen(false); };

  return (
    <div className="dashboard-root">
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="sidebar-logo-icon" style={{ width: 30, height: 30, fontSize: 14 }}>🏦</div>
          <span className="font-display" style={{ fontWeight: 700 }}>NexBank</span>
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏦</div>
          <span className="sidebar-logo-text">NexBank</span>
        </div>

        {["main", "admin", "settings"].map(section => (
          <div key={section}>
            <div className="nav-section-label">{SECTION_LABELS[section]}</div>
            {NAV_ITEMS.filter(i => i.section === section).map(item => (
              <button
                key={item.id}
                className={`nav-item${activePage === item.id ? " active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || user?.email}</div>
              <div className="user-role">Account Holder</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={logout}>
            ⏏ Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <ActivePage onNavigate={navigate} />
      </main>
    </div>
  );
}