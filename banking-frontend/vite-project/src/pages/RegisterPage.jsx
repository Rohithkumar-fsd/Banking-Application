import { useState } from "react";
import { registerUser } from "../services/api";

export default function RegisterPage({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await registerUser(form);
      const text = await res.text();
      if (!res.ok) { setError(text || "Registration failed"); return; }
      setSuccess("Account created! Redirecting to sign in…");
      setTimeout(onSwitch, 1500);
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-hero">
        <div className="hero-logo">
          <div className="hero-logo-icon">🏦</div>
          <span className="hero-logo-text font-display">NexBank</span>
        </div>
        <h1 className="hero-title">
          Open your account
          <span className="accent-word">in minutes.</span>
        </h1>
        <p className="hero-subtitle">
          Join thousands of users who trust NexBank for secure, modern banking. No paperwork. No waiting.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">Free</div>
            <div className="hero-stat-label">No fees</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">Instant</div>
            <div className="hero-stat-label">Transfers</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">Secure</div>
            <div className="hero-stat-label">JWT Auth</div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <h2 className="form-heading">Create account</h2>
        <p className="form-subheading">Get started with NexBank today</p>

        {error && <div className="toast toast-error">⚠️ {error}</div>}
        {success && <div className="toast toast-success">✓ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : "Create account →"}
            </button>
          </div>
        </form>

        <p className="switch-text">
          Already have an account?{" "}
          <button className="link-btn" onClick={onSwitch}>Sign in</button>
        </p>
      </div>
    </div>
  );
}