import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandCube from "../components/BrandCube";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const preview = form.name.trim() || "Your name";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "That account could not be created."
      );
      setBusy(false);
    }
  }

  function set(key) {
    return e => setForm({ ...form, [key]: e.target.value });
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <BrandCube name={preview} small />
        <span className="nav-wordmark">
          <b>{preview} / 75</b>
          <span>Habit tracker</span>
        </span>
      </div>

      <div className="auth-layout">
        <div className="auth-pitch">
          <span className="eyebrow">Day zero</span>

          <h1>
            Put your name
            <br />
            <em>on the next 75 days.</em>
          </h1>

          <p>
            The name you enter becomes the wordmark at the top of the app,
            the initial on the cube and the greeting on your dashboard. You
            can change it any time from the dashboard.
          </p>

          <ul className="auth-points">
            <li>
              <i aria-hidden="true" />
              Your day counter starts the moment you sign up
            </li>
            <li>
              <i aria-hidden="true" />
              Six starter habits are waiting, edit or delete any of them
            </li>
            <li>
              <i aria-hidden="true" />
              Nothing is shared and nothing leaves your machine
            </li>
          </ul>
        </div>

        <section className="auth-card">
          <span className="eyebrow">Create account</span>
          <h2>Start your 75</h2>
          <p>Three fields and you are in.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <label className="field">
              Your name
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Rhea, Kabir, Sam"
                maxLength={28}
                autoFocus
                required
              />
            </label>

            <div className="name-preview">
              <BrandCube name={preview} />

              <div className="name-preview-text">
                <b>{preview} / 75</b>
                <span>How your dashboard will look</span>
              </div>
            </div>

            <label className="field">
              Email
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              Password
              <input
                type="password"
                minLength={8}
                value={form.password}
                onChange={set("password")}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </label>

            <button className="primary-button" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
