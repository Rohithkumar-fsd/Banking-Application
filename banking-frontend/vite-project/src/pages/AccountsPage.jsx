import { useState, useEffect } from "react";
import { getAllAccounts, createAccount, getAllUsers } from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: "", accountType: "SAVINGS", balance: 0 });
  const [msg, setMsg]   = useState({ type: "", text: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [accRes, userRes] = await Promise.all([getAllAccounts(), getAllUsers()]);
      if (accRes.ok)  setAccounts(await accRes.json());
      if (userRes.ok) setUsers(await userRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setMsg({ type: "", text: "" });
    try {
      const res = await createAccount(form.userId, { accountType: form.accountType, balance: parseFloat(form.balance) });
      const text = await res.text();
      if (!res.ok) { setMsg({ type: "error", text: text || "Failed to create account" }); return; }
      setMsg({ type: "success", text: "Account created successfully!" });
      setShowModal(false);
      setForm({ userId: "", accountType: "SAVINGS", balance: 0 });
      await load();
    } catch { setMsg({ type: "error", text: "Server error" }); }
    finally { setCreating(false); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">All bank accounts in the system</p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => setShowModal(true)}>
          + Open Account
        </button>
      </div>

      <div className="content-area">
        {msg.text && (
          <div className={`toast toast-${msg.type === "error" ? "error" : "success"}`}>
            {msg.type === "success" ? "✓ " : "⚠️ "}{msg.text}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">All Accounts ({accounts.length})</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-full"><span className="spinner" /> Loading accounts…</div>
            ) : accounts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⬡</div>
                <div className="empty-state-text">No accounts found. Create one to get started.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Account No.</th><th>Type</th><th>Account Holder</th><th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id}>
                        <td style={{ color: "var(--text-muted)" }}>#{acc.id}</td>
                        <td>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: 1 }}>
                            {acc.accountNumber}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${acc.accountType === "SAVINGS" ? "badge-blue" : "badge-gold"}`}>
                            {acc.accountType}
                          </span>
                        </td>
                        <td>{acc.user ? (acc.user.name || acc.user.email) : `User #${acc.userId}`}</td>
                        <td>
                          <span style={{ fontFamily: "var(--font-display)", color: "var(--green)", fontWeight: 700 }}>
                            {fmt(acc.balance)}
                          </span>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Open New Account</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Account Holder</label>
                  <select className="form-input" value={form.userId}
                    onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
                    <option value="">Select user…</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select className="form-input" value={form.accountType}
                    onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))}>
                    <option value="SAVINGS">Savings</option>
                    <option value="CURRENT">Current</option>
                    <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Deposit (₹)</label>
                  <input className="form-input" type="number" min={0} step={0.01} placeholder="0.00"
                    value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={creating}>
                    {creating ? <><span className="spinner" /> Creating…</> : "Create Account"}
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