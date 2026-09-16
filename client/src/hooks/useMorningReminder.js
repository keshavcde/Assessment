import { useCallback, useEffect, useRef } from "react";

/** Local YYYY-MM-DD, matching the key the server uses. */
function todayKey() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

/** Today's reminder moment, as a Date. */
function reminderMoment(time) {
  const [h, m] = String(time || "08:00").split(":").map(Number);
  const at = new Date();

  at.setHours(h, m, 0, 0);

  return at;
}

export function notificationState() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/**
 * Fires the morning reminder once per day.
 *
 * Two things trigger it:
 *
 *   1. Catch-up. The app is opened on a day whose reminder time has
 *      already passed and the reminder has not run yet. This is the case
 *      that matters most, because most people open the app rather than
 *      leave it open overnight.
 *
 *   2. A timer, for when the app is already open as the time arrives.
 *
 * "Once per day" is recorded in localStorage against the date, so
 * refreshing the page does not make it reappear. The day is marked as
 * soon as the reminder time passes, whether or not anything was pending,
 * so ticking and then unticking a habit later cannot make it pop up
 * again unexpectedly.
 */
export default function useMorningReminder({
  userId,
  enabled,
  time,
  ready,
  pending,
  onDue
}) {
  const key = `h75_brief_${userId}`;

  // read through refs so the timer is not rebuilt on every tick of a habit
  const pendingRef = useRef(pending);
  const onDueRef = useRef(onDue);

  pendingRef.current = pending;
  onDueRef.current = onDue;

  const notify = useCallback(list => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const count = list.length;
    const names = list.slice(0, 3).map(h => h.name).join(", ");
    const more = count > 3 ? `, and ${count - 3} more` : "";

    new Notification(
      `${count} habit${count === 1 ? "" : "s"} still to log today`,
      {
        body: `${names}${more}`,
        tag: "h75-morning",
        requireInteraction: false
      }
    );
  }, []);

  useEffect(() => {
    if (!ready || !enabled || !userId) return;

    function fire() {
      const date = todayKey();

      // already handled today
      if (localStorage.getItem(key) === date) return;

      localStorage.setItem(key, date);

      const list = pendingRef.current || [];

      if (!list.length) return;

      onDueRef.current();
      notify(list);
    }

    // 1. catch-up
    if (new Date() >= reminderMoment(time)) fire();

    // 2. timer for the next occurrence
    const next = reminderMoment(time);
    if (next <= new Date()) next.setDate(next.getDate() + 1);

    let timer = setTimeout(function tick() {
      fire();
      timer = setTimeout(tick, 86400000);
    }, next - new Date());

    return () => clearTimeout(timer);
  }, [ready, enabled, time, userId, key, notify]);

  /** Asks for notification permission. Must be called from a click. */
  const requestNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";

    const result = await Notification.requestPermission();

    if (result === "granted") {
      new Notification("Morning reminders are on", {
        body: "You'll get a nudge at your reminder time while the app is open.",
        tag: "h75-morning"
      });
    }

    return result;
  }, []);

  /** Lets the user re-open today's brief from the bell. */
  const clearSeen = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { requestNotifications, clearSeen, notify };
}
