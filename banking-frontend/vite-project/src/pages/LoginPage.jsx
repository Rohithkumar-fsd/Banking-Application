import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(form);
      const text = await res.text();

      console.log("LOGIN STATUS:", res.status);
      console.log("LOGIN RESPONSE:", text);

      if (!res.ok) {
        setError(text || "Login failed");
        return;
      }

      if (!text || !text.startsWith("eyJ")) {
        setError("Backend did not return valid JWT token");
        return;
      }

      localStorage.setItem("token", text);

      login({
        email: form.email,
        name: form.email.split("@")[0],
        token: text,
      });

      console.log("TOKEN AFTER SAVE:", localStorage.getItem("token"));
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Cannot connect to server. Make sure backend is running on port 8080.");
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
          Banking for the
          <span className="accent-word">digital era.</span>
        </h1>

        <p className="hero-subtitle">
          Manage your accounts, transfer funds, and track every transaction —
          all in one secure platform.
        </p>
      </div>

      <div className="auth-form-panel">
        <h2 className="form-heading">Welcome back</h2>
        <p className="form-subheading">Sign in to your account to continue</p>

        {error && <div className="toast toast-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Signing in…
              </>
            ) : (
              "Sign in →"
            )}
          </button>
        </form>

        <p className="switch-text">
          Don&apos;t have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}