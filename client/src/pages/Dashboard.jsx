import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import HabitModal from "../components/HabitModal";
import NameDialog from "../components/NameDialog";
import Celebration from "../components/Celebration";
import CountUp from "../components/CountUp";
import MorningBrief from "../components/MorningBrief";
import BrandCube, { initialOf } from "../components/BrandCube";
import useTilt from "../hooks/useTilt";
import useMorningReminder from "../hooks/useMorningReminder";
import { useAuth } from "../context/AuthContext";

const icons = {
  "Drink Water": "💧",
  Read: "📖",
  Workout: "🏋️",
  "No Sugar": "🍓",
  Meditate: "🧘",
  "Plan Tomorrow": "📝"
};

function localDateKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function challengeDay(startDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const diff = Math.floor((today - start) / 86400000) + 1;

  return Math.max(1, Math.min(75, diff));
}

/* ------------------------------------------------------------------ */

/**
 * Memoised, so typing in the search box or ticking one habit does not
 * re-render the other cards. The callbacks it receives are wrapped in
 * useCallback upstream to keep that comparison meaningful.
 */
const HabitCard = memo(function HabitCard({
  habit,
  index,
  onToggle,
  onEdit,
  onDelete
}) {
  const tilt = useTilt(6);

  return (
    <article
      className={`habit-card ${habit.completedToday ? "done" : ""}`}
      style={{ "--i": index, "--glow": habit.color }}
      {...tilt}
    >
      <button
        className="check"
        onClick={() => onToggle(habit.id)}
        aria-pressed={habit.completedToday}
        aria-label={
          habit.completedToday
            ? `Mark ${habit.name} as not done`
            : `Mark ${habit.name} as done`
        }
      >
        <span className="check-inner">
          <span className="check-face front" />
          <span className="check-face back">✓</span>
        </span>
        <span className="check-pulse" />
      </button>

      <div
        className="habit-icon"
        style={{ background: `${habit.color}1f` }}
        aria-hidden="true"
      >
        {icons[habit.name] || "🌱"}
      </div>

      <div className="habit-main">
        <div className="habit-title-row">
          <h3>{habit.name}</h3>

          <span className="frequency">
            {habit.frequency === "daily" ? "Every day" : "Selected days"}
          </span>
        </div>

        {habit.description && (
          <p className="habit-description">{habit.description}</p>
        )}

        <div className="streak-row">
          <span>
            🔥 <b className="num">{habit.currentStreak}</b> current
          </span>
          <span>
            🏆 <b className="num">{habit.bestStreak}</b> best
          </span>
        </div>
      </div>

      <div className="card-actions">
        <span className="status">
          {habit.completedToday ? "Done" : "Open"}
        </span>

        <button className="mini-button" onClick={() => onEdit(habit)}>
          Edit
        </button>

        <button
          className="mini-button danger"
          onClick={() => onDelete(habit.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
});

/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { user, updateName, updateReminder, logout } = useAuth();
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [modalHabit, setModalHabit] = useState(null);
  const [adding, setAdding] = useState(false);
  const [namingOpen, setNamingOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [party, setParty] = useState(0);
  const [error, setError] = useState("");

  const wasComplete = useRef(false);

  useEffect(() => {
    loadHabits();
  }, []);

  async function loadHabits() {
    try {
      const { data } = await api.get("/habits");
      setHabits(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Habits could not be loaded."
      );
    } finally {
      setLoaded(true);
    }
  }

  const today = localDateKey();
  const day = challengeDay(user.challengeStartDate);

  /* everything scheduled for today, ignoring the search box */
  const dueToday = useMemo(() => {
    const weekday = new Date().getDay();

    return habits
      .filter(habit => habit.active)
      .filter(
        habit =>
          habit.frequency === "daily" ||
          habit.weekdays.includes(weekday)
      );
  }, [habits]);

  /* what the reminder is about: due today and not yet ticked */
  const pending = useMemo(
    () => dueToday.filter(h => !h.completedToday),
    [dueToday]
  );

  const todaysHabits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dueToday;

    return dueToday.filter(habit =>
      habit.name.toLowerCase().includes(query)
    );
  }, [dueToday, search]);

  const completed = todaysHabits.filter(h => h.completedToday).length;

  const progress = todaysHabits.length
    ? Math.round((completed / todaysHabits.length) * 100)
    : 0;

  const bestRun = useMemo(
    () => habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0),
    [habits]
  );

  const reminder = user.reminder || { enabled: true, time: "08:00" };

  const { requestNotifications } = useMorningReminder({
    userId: user.id,
    enabled: reminder.enabled,
    time: reminder.time,
    ready: loaded,
    pending,
    onDue: () => setBriefOpen(true)
  });

  useEffect(() => {
    const full = todaysHabits.length > 0 && progress === 100;

    if (full && !wasComplete.current) {
      setParty(n => n + 1);
      wasComplete.current = true;

      const timer = setTimeout(() => setParty(0), 1900);
      return () => clearTimeout(timer);
    }

    if (!full) wasComplete.current = false;
  }, [progress, todaysHabits.length]);

  /* stable identities keep the memoised cards from re-rendering */

  const toggleHabit = useCallback(
    async id => {
      try {
        const { data } = await api.patch(`/habits/${id}/toggle`, {
          date: localDateKey()
        });

        setHabits(prev => prev.map(h => (h.id === id ? data : h)));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "That habit could not be updated."
        );
      }
    },
    []
  );

  const editHabit = useCallback(habit => setModalHabit(habit), []);

  const deleteHabit = useCallback(async id => {
    if (!window.confirm("Delete this habit? Its streak goes with it."))
      return;

    await api.delete(`/habits/${id}`);
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  async function saveHabit(data) {
    try {
      if (modalHabit) {
        const { data: updated } = await api.put(
          `/habits/${modalHabit.id}`,
          data
        );

        setHabits(prev =>
          prev.map(h => (h.id === updated.id ? updated : h))
        );
      } else {
        const { data: created } = await api.post("/habits", data);
        setHabits(prev => [...prev, created]);
      }

      closeModal();
    } catch (err) {
      setError(
        err.response?.data?.message || "That habit could not be saved."
      );
    }
  }

  async function saveName(name) {
    await updateName(name);
    setNamingOpen(false);
  }

  function closeModal() {
    setAdding(false);
    setModalHabit(null);
  }

  function signOut() {
    logout();
    navigate("/login");
  }

  const firstName = String(user.name || "").trim().split(/\s+/)[0];

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <div className="nav-brand">
          <BrandCube name={user.name} small />

          <span className="nav-wordmark">
            <b>{firstName} / 75</b>
            <span>Habit challenge</span>
          </span>
        </div>

        <div className="nav-actions">
          <button
            className={`bell ${pending.length ? "has-pending" : ""}`}
            onClick={() => setBriefOpen(true)}
            aria-label={
              pending.length
                ? `${pending.length} habits still to log today`
                : "Everything logged today"
            }
            title="Today's brief"
          >
            <span aria-hidden="true">🔔</span>
            {pending.length > 0 && (
              <span className="bell-badge num">{pending.length}</span>
            )}
          </button>

          <button
            className="name-chip"
            onClick={() => setNamingOpen(true)}
            title="Change your name"
          >
            <span className="chip-dot">{initialOf(user.name)}</span>
            <span className="chip-name">{firstName}</span>
            <span className="chip-pen">✎</span>
          </button>

          <button className="ghost-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </nav>

      {error && (
        <div className="error-box global-error">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <section className="hero">
        <div className="hero-copy-block">
          <span className="eyebrow">Day {day} of 75</span>

          <h1>
            Small promises,
            <br />
            <em>kept daily.</em>
          </h1>

          <p className="hero-lede">
            {firstName}, every tick below is a promise you made to
            yourself and then honoured. The streak is just the receipt.
          </p>

          <div className="hero-meta">
            <div>
              <b className="num">{habits.length}</b>
              <small>Habits tracked</small>
            </div>
            <div>
              <b className="num">{bestRun}</b>
              <small>Longest run</small>
            </div>
            <div>
              <b className="num">{75 - day}</b>
              <small>Days to go</small>
            </div>
          </div>
        </div>

        <div className="dial-stage">
          <div className="dial">
            <div className="ring ring-outer" />
            <div className="ring ring-mid" />
            <div className="ring ring-tick" />

            <div
              className="dial-arc"
              style={{ "--p": (day / 75).toFixed(3) }}
            />

            <div className="dial-face">
              <span className="dial-label">Day</span>
              <CountUp
                value={day}
                duration={1300}
                className="dial-value num"
              />
              <span className="dial-total num">of 75</span>
              <span className="dial-caption">
                {Math.round((day / 75) * 100)}% through
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="today-bar">
        <div className="today-date">
          <p className="eyebrow">Today</p>
          <h2>{formatDate(today)}</h2>
        </div>

        <div className="overall-progress">
          <div className="progress-label">
            <span>
              <b className="num" style={{ fontSize: "14px" }}>
                {completed}
              </b>{" "}
              of {todaysHabits.length} done
            </span>
            <b className="num">{progress}%</b>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* scaleX composites; animating width would not */}
            <div
              className="progress-fill"
              style={{ "--v": progress / 100 }}
            />
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div>
          <h2>Today's habits</h2>
          <p>
            {progress === 100 && todaysHabits.length
              ? "Everything on today's list is done. Rest properly."
              : "Tick them off as you go. No streak is lost until the day ends."}
          </p>
        </div>

        <div className="toolbar-actions">
          <div className="search">
            <span aria-hidden="true">⌕</span>
            <input
              placeholder="Find a habit"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Find a habit"
            />
          </div>

          <button
            className="primary-button"
            onClick={() => setAdding(true)}
          >
            Add habit
          </button>
        </div>
      </section>

      <section className="habit-list">
        {todaysHabits.map((habit, i) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            index={i}
            onToggle={toggleHabit}
            onEdit={editHabit}
            onDelete={deleteHabit}
          />
        ))}

        {!todaysHabits.length && (
          <div className="empty">
            <span className="empty-mark" aria-hidden="true">
              🌱
            </span>
            <h3>{search ? "Nothing matches that" : "Nothing scheduled"}</h3>
            <p>
              {search
                ? "Clear the search to see the rest of today's list."
                : "Add your first habit and it will show up here tomorrow morning too."}
            </p>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span>{firstName} / 75</span>
        <i aria-hidden="true" />
        <span>Show up, keep going</span>
      </footer>

      {(adding || modalHabit) && (
        <HabitModal
          habit={modalHabit}
          onClose={closeModal}
          onSave={saveHabit}
        />
      )}

      {namingOpen && (
        <NameDialog
          currentName={user.name}
          onClose={() => setNamingOpen(false)}
          onSave={saveName}
        />
      )}

      {briefOpen && (
        <MorningBrief
          name={firstName}
          pending={pending}
          dueToday={dueToday.length}
          reminder={reminder}
          onToggle={toggleHabit}
          onSaveReminder={updateReminder}
          onRequestNotifications={requestNotifications}
          onClose={() => setBriefOpen(false)}
        />
      )}

      {party > 0 && <Celebration key={party} />}
    </main>
  );
}
