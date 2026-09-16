function toDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateKey, amount) {
  const date = toDate(dateKey);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}

function todayKey() {
  return formatDate(new Date());
}

function isScheduled(habit, dateKey) {
  if (habit.frequency === "daily") return true;
  return habit.weekdays.includes(toDate(dateKey).getDay());
}

function getDatesForHabit(habit, completions) {
  return completions
    .filter(c => c.habitId === habit.id)
    .map(c => c.date);
}

function getCurrentStreak(habit, completionDates) {
  const done = new Set(completionDates);
  let cursor = todayKey();
  let streak = 0;

  while (true) {
    if (isScheduled(habit, cursor)) {
      if (!done.has(cursor)) break;
      streak++;
    }

    cursor = addDays(cursor, -1);

    if (streak > 1000) break;
  }

  return streak;
}

function getBestStreak(habit, completionDates) {
  if (!completionDates.length) return 0;

  const done = new Set(completionDates);
  const sorted = [...done].sort();
  let best = 0;

  for (const start of sorted) {
    if (!isScheduled(habit, start)) continue;

    let streak = 0;
    let cursor = start;

    while (done.has(cursor) && isScheduled(habit, cursor)) {
      streak++;
      cursor = addDays(cursor, 1);

      let guard = 0;
      while (!isScheduled(habit, cursor) && guard < 8) {
        cursor = addDays(cursor, 1);
        guard++;
      }
    }

    best = Math.max(best, streak);
  }

  return best;
}

module.exports = {
  todayKey,
  isScheduled,
  getDatesForHabit,
  getCurrentStreak,
  getBestStreak
};
