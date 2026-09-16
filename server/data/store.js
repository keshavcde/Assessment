/**
 * Temporary in-memory storage. No database, no ORM.
 * Restarting the server resets everything.
 */

const today = new Date().toISOString().slice(0, 10);

/**
 * The habits every new account starts with. Kept separate from the
 * store so registration can stamp out a fresh copy per user.
 */
const STARTER_HABITS = [
  {
    name: "Drink Water",
    description: "Three litres across the day.",
    frequency: "daily",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "#5BA8F5"
  },
  {
    name: "Read",
    description: "Twenty pages, anything you like.",
    frequency: "daily",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "#E8B15C"
  },
  {
    name: "Workout",
    description: "Forty-five minutes of real effort.",
    frequency: "daily",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "#EE6C55"
  },
  {
    name: "No Sugar",
    description: "Nothing with added sugar.",
    frequency: "daily",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "#8A7BE8"
  },
  {
    name: "Meditate",
    description: "Ten quiet minutes.",
    frequency: "weekly",
    weekdays: [1, 3, 5],
    color: "#46D9B0"
  },
  {
    name: "Plan Tomorrow",
    description: "Write down the next day before bed.",
    frequency: "weekly",
    weekdays: [0, 6],
    color: "#D28B9B"
  }
];

/** What a new account's morning reminder is set to. */
const DEFAULT_REMINDER = { enabled: true, time: "08:00" };

let seq = 0;

/** Small unique-enough id generator for a demo app. */
function makeId(prefix) {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq}`;
}

/** Returns a fresh set of starter habits owned by `userId`. */
function starterHabitsFor(userId) {
  return STARTER_HABITS.map(habit => ({
    id: makeId("h"),
    userId,
    active: true,
    ...habit
  }));
}

const store = {
  users: [
    {
      id: "u1",
      name: "Demo",
      email: "demo@example.com",
      password: "Password@123",
      challengeStartDate: today,
      reminder: { enabled: true, time: "08:00" }
    }
  ],

  habits: [],

  completions: []
};

// give the demo account its starter set
store.habits = starterHabitsFor("u1");

module.exports = store;
module.exports.makeId = makeId;
module.exports.starterHabitsFor = starterHabitsFor;
module.exports.DEFAULT_REMINDER = DEFAULT_REMINDER;
