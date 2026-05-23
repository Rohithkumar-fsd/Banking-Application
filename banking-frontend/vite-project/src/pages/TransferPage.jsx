import { useState, useEffect } from "react";
import { getAllAccounts, transfer } from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

export default function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ fromAccount: "", toAccount: "", amount: "" });
  const [msg, setMsg]   = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getAllAccounts().then(r => r.json()).then(setAccounts).catch(() => {});
  }, []);

  const fromAcc = accounts.find(a => a.accountNumber === form.fromAccount);
  const toAcc   = accounts.find(a => a.accountNumber === form.toAccount);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (form.fromAccount === form.toAccount) { setMsg({ type: "error", text: "From and To accounts cannot be the same." }); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setMsg({ type: "error", text: "Enter a valid amount." }); return; }
    setLoading(true);
    try {
      const res = await transfer(form.fromAccount, form.toAccount, parseFloat(form.amount));
      const text = await res.text();
      if (!res.ok) { setMsg({ type: "error", text: text || "Transfer failed" }); return; }
      setMsg({ type: "success", text: text || "Transfer successful!" });
      setHistory(h => [{ from: form.fromAccount, to: form.toAccount, amount: parseFloat(form.amount), time: new Date().toLocaleString("en-IN") }, ...h.slice(0, 9)]);
      setForm(f => ({ ...f, amount: "" }));
      const accRes = await getAllAccounts();
      if (accRes.ok) setAccounts(await accRes.json());
    } catch { setMsg({ type: "error", text: "Server error" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transfer Funds</h1>
          <p className="page-subtitle">Move money between accounts instantly</p>
        </div>
      </div>

      <div className="content-area">
        {msg.text && (
          <div className={`toast toast-${msg.type === "error" ? "error" : "success"}`}>
            {msg.type === "success" ? "✓ " : "⚠️ "}{msg.text}
          </div>
        )}

        <div className="grid-2">
          {/* Form */}
          <div className="card">
            <div className="card-header"><span className="card-title">New Transfer</span></div>
            <div className="card-body">
              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label className="form-label">From Account</label>
                  <select className="form-input" value={form.fromAccount}
                    onChange={e => setForm(f => ({ ...f, fromAccount: e.target.value }))} required>
                    <option value="">Select source account…</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.accountNumber}>
                        {a.accountNumber} ({a.accountType}) — {fmt(a.balance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                  <div className="transfer-arrow">⇣</div>
                </div>
                <div className="form-group">
                  <label className="form-label">To Account</label>
                  <select className="form-input" value={form.toAccount}
                    onChange={e => setForm(f => ({ ...f, toAccount: e.target.value }))} required>
                    <option value="">Select destination account…</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.accountNumber}>
                        {a.accountNumber} ({a.accountType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input className="form-input" type="number" min={0.01} step={0.01} placeholder="0.00"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Processing…</> : "⇄ Transfer Now"}
                </button>
              </form>
            </div>
          </div>

          {/* Preview + history */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">Transfer Preview</span></div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[{ label: "From", acc: fromAcc }, { label: "To", acc: toAcc }].map(({ label, acc }, idx) => (
                    <div key={label}>
                      <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: 14, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                        {acc ? (
                          <>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 1 }}>{acc.accountNumber}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{label === "From" ? `Balance: ${fmt(acc.balance)}` : acc.accountType}</div>
                          </>
                        ) : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Not selected</span>}
                      </div>
                      {idx === 0 && <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}><div className="transfer-arrow">⇣</div></div>}
                    </div>
                  ))}
                  {form.amount && parseFloat(form.amount) > 0 && (
                    <div style={{ background: "var(--accent-glow)", borderRadius: "var(--radius-sm)", padding: 14, border: "1px solid rgba(61,127,255,0.25)", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Transfer Amount</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--accent)", letterSpacing: -1 }}>
                        {fmt(parseFloat(form.amount))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">Session History</span></div>
                <div className="card-body">
                  <div className="tx-list">
                    {history.map((h, i) => (
                      <div key={i} className="tx-item">
                        <div className="tx-icon debit">⇄</div>
                        <div className="tx-info">
                          <div className="tx-type" style={{ fontSize: 12 }}>{h.from} → {h.to}</div>
                          <div className="tx-date">{h.time}</div>
                        </div>
                        <div className="tx-amount debit">-{fmt(h.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}