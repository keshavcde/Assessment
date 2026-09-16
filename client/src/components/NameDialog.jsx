import { useState } from "react";
import BrandCube from "./BrandCube";

/**
 * Lets the person set the name the whole app is branded with.
 * The preview updates as they type, so they can see the wordmark
 * and the cube before they commit.
 */
export default function NameDialog({ currentName, onClose, onSave }) {
  const [name, setName] = useState(currentName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const preview = name.trim() || "Your name";

  async function submit(e) {
    e.preventDefault();

    const value = name.trim();

    if (!value) {
      setError("Enter a name to show on your dashboard.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(value);
    } catch (err) {
      setError(
        err.response?.data?.message || "That name could not be saved."
      );
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">Your name</span>
            <h2>Who is this challenge for?</h2>
            <p>
              This is the name on your dashboard, your wordmark and your
              daily greeting. Change it whenever you like.
            </p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <label className="field">
            Display name
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rhea, Kabir, Sam"
              maxLength={28}
              autoFocus
            />
          </label>

          <div className="name-preview">
            <BrandCube name={preview} />

            <div className="name-preview-text">
              <b>{preview} / 75</b>
              <span>Habit challenge</span>
            </div>
          </div>

          <button className="primary-button" disabled={saving}>
            {saving ? "Saving…" : "Save name"}
          </button>
        </form>
      </div>
    </div>
  );
}
