import { useState, useEffect } from "react";
import { getAllAccounts, deposit, withdraw, getHistory } from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (dt) => dt
  ? new Date(dt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "";

export default function TransactionsPage() {
  const [accounts, setAccounts]     = useState([]);
  const [selectedAcc, setSelectedAcc] = useState("");
  const [txs, setTxs]               = useState([]);
  const [txLoading, setTxLoading]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState({ type: "", text: "" });
  const [txForm, setTxForm]         = useState({ type: "deposit", accountNumber: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter]         = useState("ALL");

  useEffect(() => {
    getAllAccounts()
      .then(r => r.json())
      .then(data => { setAccounts(data); if (data[0]) setSelectedAcc(data[0].id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAcc) return;
    setTxLoading(true);
    getHistory(selectedAcc)
      .then(r => r.json()).then(setTxs)
      .catch(() => setTxs([]))
      .finally(() => setTxLoading(false));
  }, [selectedAcc]);

  const handleTx = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!txForm.accountNumber || !txForm.amount || parseFloat(txForm.amount) <= 0) {
      setMsg({ type: "error", text: "Enter a valid account number and amount." });
      return;
    }
    setSubmitting(true);
    try {
      const fn = txForm.type === "deposit" ? deposit : withdraw;
      const res = await fn(txForm.accountNumber, parseFloat(txForm.amount));
      const text = await res.text();
      if (!res.ok) { setMsg({ type: "error", text: text || "Transaction failed" }); return; }
      setMsg({ type: "success", text: text || "Transaction successful!" });
      setTxForm(f => ({ ...f, amount: "" }));
      if (selectedAcc) {
        const txRes = await getHistory(selectedAcc);
        if (txRes.ok) setTxs(await txRes.json());
        const accRes = await getAllAccounts();
        if (accRes.ok) setAccounts(await accRes.json());
      }
    } catch { setMsg({ type: "error", text: "Server error" }); }
    finally { setSubmitting(false); }
  };

  const sorted = [...(filter === "ALL" ? txs : txs.filter(t => t.type === filter))]
    .sort((a, b) => new Date(b.time) - new Date(a.time));
  const accObj = accounts.find(a => a.id === parseInt(selectedAcc));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Deposit, withdraw, and view your transaction history</p>
        </div>
      </div>

      <div className="content-area">
        {msg.text && (
          <div className={`toast toast-${msg.type === "error" ? "error" : "success"}`}>
            {msg.type === "success" ? "✓ " : "⚠️ "}{msg.text}
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Deposit / Withdraw */}
          <div className="card">
            <div className="card-header"><span className="card-title">New Transaction</span></div>
            <div className="card-body">
              <form onSubmit={handleTx}>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  {["deposit", "withdraw"].map(t => (
                    <button key={t} type="button"
                      className={`btn btn-sm ${txForm.type === t ? "btn-primary" : "btn-ghost"}`}
                      style={{ flex: 1, width: "auto" }}
                      onClick={() => setTxForm(f => ({ ...f, type: t }))}>
                      {t === "deposit" ? "↑ Deposit" : "↓ Withdraw"}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <select className="form-input" value={txForm.accountNumber}
                    onChange={e => setTxForm(f => ({ ...f, accountNumber: e.target.value }))} required>
                    <option value="">Select account…</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.accountNumber}>
                        {a.accountNumber} — {a.accountType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input className="form-input" type="number" min={0.01} step={0.01} placeholder="0.00"
                    value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <button type="submit"
                  className={`btn ${txForm.type === "deposit" ? "btn-success" : "btn-danger"}`}
                  style={{ width: "100%", marginTop: 4 }} disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Processing…</> :
                    txForm.type === "deposit" ? "↑ Deposit Funds" : "↓ Withdraw Funds"}
                </button>
              </form>
            </div>
          </div>

          {/* Account selector + filter */}
          <div className="card">
            <div className="card-header"><span className="card-title">View History</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Select Account</label>
                <select className="form-input" value={selectedAcc} onChange={e => setSelectedAcc(e.target.value)}>
                  {loading ? <option>Loading…</option> : accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.accountNumber} — {a.accountType}</option>
                  ))}
                </select>
              </div>
              {accObj && (
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16, marginTop: 8 }}>
                  <div className="stat-label">Current Balance</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--green)", letterSpacing: -1 }}>
                    {fmt(accObj.balance)}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    {accObj.accountType} · {txs.length} transactions
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                {["ALL", "CREDIT", "DEBIT"].map(f => (
                  <button key={f} type="button"
                    className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                    style={{ flex: 1, width: "auto" }} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Transaction History {filter !== "ALL" && `· ${filter}`}</span>
            <span className="badge badge-blue">{sorted.length} records</span>
          </div>
          <div className="card-body">
            {txLoading ? (
              <div className="loading-full"><span className="spinner" /> Loading…</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No transactions found.</div>
              </div>
            ) : (
              <div className="tx-list">
                {sorted.map((tx, i) => {
                  const isCredit = tx.type === "CREDIT";
                  return (
                    <div key={i} className="tx-item">
                      <div className={`tx-icon ${isCredit ? "credit" : "debit"}`}>{isCredit ? "↑" : "↓"}</div>
                      <div className="tx-info">
                        <div className="tx-type">{tx.type}</div>
                        <div className="tx-date">{fmtDate(tx.time)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={`tx-amount ${isCredit ? "credit" : "debit"}`}>
                          {isCredit ? "+" : "-"}{fmt(tx.amount)}
                        </div>
                        <span className="tx-status success">{tx.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}