const express = require("express");
const cors = require("cors");

const store = require("./data/store");
const {
  makeId,
  starterHabitsFor,
  DEFAULT_REMINDER
} = require("./data/store");

const {
  todayKey,
  isScheduled,
  getDatesForHabit,
  getCurrentStreak,
  getBestStreak
} = require("./utils/streaks");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const NAME_MAX = 28;

function auth(req, res, next) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ message: "Sign in to continue" });
  }

  const user = store.users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ message: "That session is no longer valid" });
  }

  req.user = user;
  next();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    challengeStartDate: user.challengeStartDate,
    reminder: user.reminder || { ...DEFAULT_REMINDER }
  };
}

function habitResponse(habit) {
  const dates = getDatesForHabit(habit, store.completions);
  const today = todayKey();

  return {
    ...habit,
    currentStreak: getCurrentStreak(habit, dates),
    bestStreak: getBestStreak(habit, dates),
    completedToday: dates.includes(today)
  };
}

/** Trims and length-checks a display name. Returns null if unusable. */
function cleanName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  if (!name || name.length > NAME_MAX) return null;
  return name;
}

/* ------------------------------ health ----------------------------- */

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "75 day challenge API is running" });
});

/* ------------------------------- auth ------------------------------ */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = store.users.find(
    u =>
      u.email.toLowerCase() === String(email || "").toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return res
      .status(401)
      .json({ message: "That email and password do not match an account" });
  }

  res.json({ user: publicUser(user) });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  const cleaned = cleanName(name);

  if (!cleaned) {
    return res
      .status(400)
      .json({ message: `Enter a name of up to ${NAME_MAX} characters` });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (String(password).length < 8) {
    return res
      .status(400)
      .json({ message: "Use a password of at least 8 characters" });
  }

  const existing = store.users.find(
    u => u.email.toLowerCase() === String(email).toLowerCase()
  );

  if (existing) {
    return res
      .status(409)
      .json({ message: "An account already uses that email" });
  }

  const user = {
    id: makeId("u"),
    name: cleaned,
    email: String(email).toLowerCase(),
    password,
    challengeStartDate: todayKey(),
    reminder: { ...DEFAULT_REMINDER }
  };

  store.users.push(user);

  // a brand new dashboard is a bad first impression, so seed it
  store.habits.push(...starterHabitsFor(user.id));

  res.status(201).json({ user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json(publicUser(req.user));
});

/**
 * Rename the account. This is what drives the wordmark, the cube
 * initial and the greeting, so the app is never tied to one name.
 */
app.patch("/api/auth/me", auth, (req, res) => {
  const cleaned = cleanName(req.body.name);

  if (!cleaned) {
    return res
      .status(400)
      .json({ message: `Enter a name of up to ${NAME_MAX} characters` });
  }

  req.user.name = cleaned;

  res.json(publicUser(req.user));
});

/* ----------------------------- reminders ---------------------------- */

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * What the user still owes today.
 *
 * "Pending" means scheduled for this date and not yet ticked. A habit that
 * is not scheduled today is not pending, it is simply not due, so it never
 * appears in the reminder.
 */
function pendingFor(user, date) {
  return store.habits
    .filter(h => h.userId === user.id && h.active)
    .filter(h => isScheduled(h, date))
    .filter(
      h =>
        !store.completions.some(
          c => c.habitId === h.id && c.userId === user.id && c.date === date
        )
    );
}

app.get("/api/reminders", auth, (req, res) => {
  const date = todayKey();

  const due = store.habits
    .filter(h => h.userId === req.user.id && h.active)
    .filter(h => isScheduled(h, date));

  const pending = pendingFor(req.user, date);

  res.json({
    date,
    reminder: req.user.reminder || { ...DEFAULT_REMINDER },
    dueToday: due.length,
    completedToday: due.length - pending.length,
    pendingCount: pending.length,
    pending: pending.map(habitResponse)
  });
});

app.patch("/api/reminders", auth, (req, res) => {
  const { enabled, time } = req.body;

  const next = { ...(req.user.reminder || DEFAULT_REMINDER) };

  if (enabled !== undefined) next.enabled = Boolean(enabled);

  if (time !== undefined) {
    if (!TIME_PATTERN.test(String(time))) {
      return res
        .status(400)
        .json({ message: "Use a 24 hour time such as 07:30" });
    }
    next.time = String(time);
  }

  req.user.reminder = next;

  res.json(next);
});

/* ------------------------------ habits ----------------------------- */

app.get("/api/habits", auth, (req, res) => {
  const habits = store.habits
    .filter(habit => habit.userId === req.user.id)
    .map(habitResponse);

  res.json(habits);
});

app.post("/api/habits", auth, (req, res) => {
  const {
    name,
    description = "",
    frequency = "daily",
    weekdays = [0, 1, 2, 3, 4, 5, 6],
    color = "#E8B15C"
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Give the habit a name" });
  }

  const habit = {
    id: makeId("h"),
    userId: req.user.id,
    name: name.trim(),
    description,
    frequency,
    weekdays: frequency === "daily" ? [0, 1, 2, 3, 4, 5, 6] : weekdays,
    active: true,
    color
  };

  store.habits.push(habit);

  res.status(201).json(habitResponse(habit));
});

app.put("/api/habits/:id", auth, (req, res) => {
  const habit = store.habits.find(
    h => h.id === req.params.id && h.userId === req.user.id
  );

  if (!habit) {
    return res.status(404).json({ message: "That habit no longer exists" });
  }

  const { name, description, frequency, weekdays, color, active } = req.body;

  if (name !== undefined) habit.name = name.trim();
  if (description !== undefined) habit.description = description;
  if (frequency !== undefined) habit.frequency = frequency;
  if (weekdays !== undefined) habit.weekdays = weekdays;
  if (color !== undefined) habit.color = color;
  if (active !== undefined) habit.active = active;

  if (habit.frequency === "daily") {
    habit.weekdays = [0, 1, 2, 3, 4, 5, 6];
  }

  res.json(habitResponse(habit));
});

app.delete("/api/habits/:id", auth, (req, res) => {
  const index = store.habits.findIndex(
    h => h.id === req.params.id && h.userId === req.user.id
  );

  if (index === -1) {
    return res.status(404).json({ message: "That habit no longer exists" });
  }

  const habitId = store.habits[index].id;

  store.habits.splice(index, 1);

  store.completions = store.completions.filter(c => c.habitId !== habitId);

  res.json({ message: "Habit deleted" });
});

app.patch("/api/habits/:id/toggle", auth, (req, res) => {
  const date = req.body.date || todayKey();

  const habit = store.habits.find(
    h => h.id === req.params.id && h.userId === req.user.id
  );

  if (!habit) {
    return res.status(404).json({ message: "That habit no longer exists" });
  }

  if (!isScheduled(habit, date)) {
    return res
      .status(400)
      .json({ message: "This habit is not scheduled for that day" });
  }

  const index = store.completions.findIndex(
    c =>
      c.habitId === habit.id && c.userId === req.user.id && c.date === date
  );

  if (index === -1) {
    store.completions.push({
      id: makeId("c"),
      habitId: habit.id,
      userId: req.user.id,
      date
    });
  } else {
    store.completions.splice(index, 1);
  }

  res.json(habitResponse(habit));
});

/* ---------------------------- dashboard ---------------------------- */

app.get("/api/dashboard", auth, (req, res) => {
  const today = todayKey();

  const habits = store.habits
    .filter(h => h.userId === req.user.id && h.active)
    .filter(h => isScheduled(h, today));

  const completed = habits.filter(h =>
    store.completions.some(
      c =>
        c.habitId === h.id && c.userId === req.user.id && c.date === today
    )
  );

  res.json({
    userName: req.user.name,
    today,
    challengeStartDate: req.user.challengeStartDate,
    totalToday: habits.length,
    completedToday: completed.length
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
