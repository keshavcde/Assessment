import { useState } from "react";
import { notificationState } from "../hooks/useMorningReminder";

const ICONS = {
  "Drink Water": "💧",
  Read: "📖",
  Workout: "🏋️",
  "No Sugar": "🍓",
  Meditate: "🧘",
  "Plan Tomorrow": "📝"
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * The morning brief: what is still unlogged today.
 *
 * Habits can be ticked straight from here, so the reminder is somewhere
 * to act rather than somewhere to be told off. The list shrinks as you
 * go and ends on a finished state.
 */
export default function MorningBrief({
  name,
  pending,
  dueToday,
  reminder,
  onToggle,
  onSaveReminder,
  onRequestNotifications,
  onClose
}) {
  const [permission, setPermission] = useState(notificationState());
  const [saving, setSaving] = useState(false);

  const done = dueToday - pending.length;
  const allDone = pending.length === 0;

  async function askForNotifications() {
    setPermission(await onRequestNotifications());
  }

  async function changeTime(time) {
    setSaving(true);
    try {
      await onSaveReminder({ time });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal brief"
        onMouseDown={e => e.stopPropagation()}
        role="dialog"
        aria-label="Morning brief"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">Morning brief</span>
            <h2>
              {greeting()}, {name}
            </h2>
            <p>
              {allDone
                ? "Everything scheduled for today is logged. Nothing is waiting on you."
                : `${pending.length} of ${dueToday} still to log. Tick them here as you do them.`}
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

        {allDone ? (
          <div className="brief-done">
            <span aria-hidden="true">✓</span>
            <p>
              {dueToday} logged today. Come back tomorrow and the list
              starts again.
            </p>
          </div>
        ) : (
          <ul className="brief-list">
            {pending.map((habit, i) => (
              <li
                key={habit.id}
                className="brief-row"
                style={{ "--glow": habit.color, "--i": i }}
              >
                <button
                  className="brief-tick"
                  onClick={() => onToggle(habit.id)}
                  aria-label={`Log ${habit.name}`}
                >
                  ✓
                </button>

                <span className="brief-icon" aria-hidden="true">
                  {ICONS[habit.name] || "🌱"}
                </span>

                <span className="brief-text">
                  <b>{habit.name}</b>
                  {habit.description && <small>{habit.description}</small>}
                </span>

                {habit.currentStreak > 0 && (
                  <span className="brief-streak num">
                    🔥 {habit.currentStreak}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {done > 0 && !allDone && (
          <p className="brief-note">
            {done} already logged today. Keep going.
          </p>
        )}

        <div className="brief-settings">
          <label className="brief-time">
            <span>Remind me at</span>
            <input
              type="time"
              value={reminder.time}
              disabled={saving}
              onChange={e => changeTime(e.target.value)}
            />
          </label>

          {permission === "granted" ? (
            <span className="brief-perm on">Desktop alerts on</span>
          ) : permission === "unsupported" || permission === "denied" ? (
            <span className="brief-perm">
              {permission === "denied"
                ? "Alerts blocked in browser settings"
                : "Alerts not supported here"}
            </span>
          ) : (
            <button className="mini-button" onClick={askForNotifications}>
              Enable desktop alerts
            </button>
          )}
        </div>

        <button className="primary-button" onClick={onClose}>
          {allDone ? "Close" : "Start the day"}
        </button>
      </div>
    </div>
  );
}
