import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser } from "../services/api";

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    try { const res = await getAllUsers(); if (res.ok) setUsers(await res.json()); }
    catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await deleteUser(id);
      const text = await res.text();
      setMsg({ type: res.ok ? "success" : "error", text: text || (res.ok ? "User deleted." : "Failed.") });
      if (res.ok) await load();
    } catch { setMsg({ type: "error", text: "Server error" }); }
  };

  const openEdit = (u) => { setEditUser(u); setEditForm({ name: u.name || "", email: u.email || "" }); };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await updateUser(editUser.id, editForm);
      const text = await res.text();
      setMsg({ type: res.ok ? "success" : "error", text: text || (res.ok ? "User updated." : "Failed.") });
      if (res.ok) { setEditUser(null); await load(); }
    } catch { setMsg({ type: "error", text: "Server error" }); }
    setSaving(false);
  };

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (u) => (u.name || u.email || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all registered users</p>
        </div>
        <input className="form-input" style={{ width: 240, marginBottom: 0 }}
          placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="content-area">
        {msg.text && (
          <div className={`toast toast-${msg.type === "error" ? "error" : "success"}`}>
            {msg.type === "success" ? "✓ " : "⚠️ "}{msg.text}
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">All Users ({filtered.length})</span></div>
          <div className="card-body">
            {loading ? (
              <div className="loading-full"><span className="spinner" /> Loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◉</div>
                <div className="empty-state-text">No users found.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>ID</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, var(--accent), #7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {initials(u)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                        <td><span className="badge badge-blue">#{u.id}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✎ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>✕ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit User</span>
              <button className="modal-close" onClick={() => setEditUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                    {saving ? <><span className="spinner" /> Saving…</> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}