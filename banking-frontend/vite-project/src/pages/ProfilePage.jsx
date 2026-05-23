import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg]       = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const initials = (user?.name || user?.email || "U")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (pwForm.newPassword !== pwForm.confirm) { setMsg({ type: "error", text: "New passwords do not match." }); return; }
    if (pwForm.newPassword.length < 6)         { setMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    if (!user?.id)                              { setMsg({ type: "error", text: "User ID not found. Please log out and log back in." }); return; }
    setSaving(true);
    try {
      const res = await changePassword(user.id, pwForm.oldPassword, pwForm.newPassword);
      const text = await res.text();
      setMsg({ type: res.ok ? "success" : "error", text: text || (res.ok ? "Password changed!" : "Failed") });
      if (res.ok) setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch { setMsg({ type: "error", text: "Server error" }); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="content-area">
        <div className="grid-2">
          {/* Profile info */}
          <div className="card">
            <div className="card-header"><span className="card-title">Your Profile</span></div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 28px", textAlign: "center" }}>
                <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, var(--accent), #7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 16, boxShadow: "0 0 30px rgba(61,127,255,0.3)" }}>
                  {initials}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  {user?.name || "Account Holder"}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{user?.email}</div>
                {user?.id && <span className="badge badge-blue" style={{ marginTop: 10 }}>ID #{user.id}</span>}
              </div>

              <div className="divider" />

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name",      value: user?.name  || "—"      },
                  { label: "Email Address",  value: user?.email || "—"      },
                  { label: "Account Status", value: "Active ✓"              },
                ].map(field => (
                  <div key={field.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{field.value}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <button className="btn btn-danger" style={{ width: "100%" }} onClick={logout}>⏏ Sign Out</button>
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="card-header"><span className="card-title">Change Password</span></div>
            <div className="card-body">
              {msg.text && (
                <div className={`toast toast-${msg.type === "error" ? "error" : "success"}`}>
                  {msg.type === "success" ? "✓ " : "⚠️ "}{msg.text}
                </div>
              )}
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={pwForm.oldPassword} onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="Min. 6 characters"
                    value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" placeholder="Re-enter new password"
                    value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                </div>
                <div style={{ background: "var(--gold-soft)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: 12, color: "var(--gold)", marginBottom: 16 }}>
                  ⚠ Make sure your new password is strong and unique.
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Updating…</> : "🔒 Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}