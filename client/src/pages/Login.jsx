import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandCube from "../components/BrandCube";
import { useAuth } from "../context/AuthContext";

const DEMO = { email: "demo@example.com", password: "Password@123" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "That email and password do not match an account."
      );
      setBusy(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <BrandCube name="75" small />
        <span className="nav-wordmark">
          <b>75 / Challenge</b>
          <span>Habit tracker</span>
        </span>
      </div>

      <div className="auth-layout">
        <div className="auth-pitch">
          <span className="eyebrow">Welcome back</span>

          <h1>
            Seventy-five days.
            <br />
            <em>One tick at a time.</em>
          </h1>

          <p>
            Pick up where you left off. Your streaks, your habits and your
            day count are exactly where you left them.
          </p>

          <ul className="auth-points">
            <li>
              <i aria-hidden="true" />
              Track daily habits and ones scheduled for set weekdays
            </li>
            <li>
              <i aria-hidden="true" />
              Current and longest streak on every habit
            </li>
            <li>
              <i aria-hidden="true" />
              The whole dashboard is branded with your own name
            </li>
          </ul>
        </div>

        <section className="auth-card">
          <span className="eyebrow">Sign in</span>
          <h2>Back to your challenge</h2>
          <p>Enter the email and password you signed up with.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <label className="field">
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="primary-button" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="demo-hint">
            <span>Just looking around?</span>
            <button
              type="button"
              className="mini-button"
              onClick={fillDemo}
            >
              Use demo account
            </button>
          </div>

          <p className="auth-switch">
            First time here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
