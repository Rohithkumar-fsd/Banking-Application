import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllAccounts, getHistory } from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function Overview({ onNavigate }) {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllAccounts();
        if (res.ok) {
          const data = await res.json();
          setAllAccounts(data);
          if (data.length > 0) {
            setAccount(data[0]);
            const txRes = await getHistory(data[0].id);
            if (txRes.ok) setTxs(await txRes.json());
          }
        }
      } catch {
        setError("Could not load account data. Check that the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const credits = txs.filter(t => t.type === "CREDIT");
  const debits  = txs.filter(t => t.type === "DEBIT");
  const totalIn  = credits.reduce((s, t) => s + (t.amount || 0), 0);
  const totalOut = debits.reduce((s, t) => s + (t.amount || 0), 0);
  const recentTxs = [...txs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user?.name || user?.email?.split("@")[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("transfer")}>⇄ Quick Transfer</button>
      </div>

      <div className="content-area">
        {error && <div className="toast toast-error">{error}</div>}

        {loading ? (
          <div className="loading-full"><span className="spinner" /> Loading your data…</div>
        ) : (
          <>
            {account ? (
              <div className="account-card">
                <div className="account-chip">✦ {account.accountType || "Savings"} Account</div>
                <div className="account-balance-label">Available Balance</div>
                <div className="account-balance">{fmt(account.balance)}</div>
                <div className="account-meta">
                  <div>
                    <div className="account-number-label">Account Number</div>
                    <div className="account-number">{account.accountNumber || "—"}</div>
                  </div>
                  <div className="account-type-badge">⬡ {account.accountType || "Savings"}</div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: 24, padding: 24 }}>
                <p className="text-secondary">No account found. Create one in the Accounts section.</p>
                <button className="btn btn-primary" style={{ width: "auto", marginTop: 14 }} onClick={() => onNavigate("accounts")}>
                  Open Account →
                </button>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon blue">⬡</div>
                <div className="stat-label">Total Accounts</div>
                <div className="stat-value blue">{allAccounts.length}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon green">↑</div>
                <div className="stat-label">Total Credits</div>
                <div className="stat-value green">{fmt(totalIn)}</div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon red">↓</div>
                <div className="stat-label">Total Debits</div>
                <div className="stat-value red">{fmt(totalOut)}</div>
              </div>
              <div className="stat-card gold">
                <div className="stat-icon gold">↕</div>
                <div className="stat-label">Transactions</div>
                <div className="stat-value gold">{txs.length}</div>
              </div>
            </div>

            <div className="quick-actions">
              {[
                { icon: "💳", label: "Deposit",  action: "transactions" },
                { icon: "💸", label: "Withdraw", action: "transactions" },
                { icon: "⇄",  label: "Transfer", action: "transfer"     },
                { icon: "📊", label: "History",  action: "transactions" },
              ].map(q => (
                <button key={q.label} className="quick-action-btn" onClick={() => onNavigate(q.action)}>
                  <div className="quick-action-icon" style={{ background: "var(--bg-elevated)" }}>{q.icon}</div>
                  <span className="quick-action-label">{q.label}</span>
                </button>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Transactions</span>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("transactions")}>View all →</button>
              </div>
              <div className="card-body">
                {recentTxs.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No transactions yet</div>
                  </div>
                ) : (
                  <div className="tx-list">
                    {recentTxs.map((tx, i) => {
                      const isCredit = tx.type === "CREDIT";
                      return (
                        <div key={i} className="tx-item">
                          <div className={`tx-icon ${isCredit ? "credit" : "debit"}`}>{isCredit ? "↑" : "↓"}</div>
                          <div className="tx-info">
                            <div className="tx-type">{tx.type}</div>
                            <div className="tx-date">{fmtDate(tx.time)}</div>
                          </div>
                          <div>
                            <div className={`tx-amount ${isCredit ? "credit" : "debit"}`}>
                              {isCredit ? "+" : "-"}{fmt(tx.amount)}
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                              <span className="tx-status success">{tx.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}