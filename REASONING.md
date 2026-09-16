# REASONING — 75 / RESET

## 1. Problem Understanding

The goal is to build a habit-tracking application around a 75-day personal improvement challenge.

A user may have several habits, for example:

* Drink water
* Read
* Workout
* Avoid sugar
* Meditate
* Plan the next day

Some habits happen every day, while others happen only on particular days.

The user needs to quickly understand:

1. What habits need to be completed today?
2. Which habits have already been completed?
3. What is the current streak?
4. What is the best streak?
5. How far along is the 75-day challenge?
6. Which habits are still incomplete?
7. What needs attention in the morning?

These requirements shaped the application's data model and UI.

---

# 2. Why React?

React was selected for the frontend because the application contains many pieces of interactive state.

For example:

* Habit completion changes immediately.
* Search filters the habit list.
* The dashboard progress changes after completing a habit.
* Users can open and close the habit modal.
* Registration changes the personalized dashboard.
* Reminder state changes based on the current day.

React's component-based architecture makes these interactions easier to manage.

The interface is separated into reusable pieces such as:

```text
Navbar
HabitCard
HabitModal
ProgressOrb
StatsCard
Dashboard
```

This also makes the application easier to extend.

---

# 3. Why Node.js and Express?

Express provides a lightweight REST API between the React frontend and application data.

The architecture is:

```text
React
  ↓
Axios
  ↓
Express REST API
  ↓
In-memory Store
```

This keeps the frontend independent from the server implementation.

For example, the frontend does not directly modify the data structure.

Instead, it sends:

```http
PATCH /api/habits/:id/toggle
```

The Express server handles the operation and returns the updated result.

---

# 4. Why No Database?

The requirement specifically asks for a solution without a database.

Therefore, MongoDB and Mongoose were intentionally excluded.

The application uses:

```text
server/data/store.js
```

as an in-memory data store.

This has an important consequence:

```text
Server restart
      ↓
Memory cleared
      ↓
Initial data loaded again
```

This is acceptable for the evaluation/demo requirement, although a production application would normally use persistent storage.

---

# 5. Personalized User Name

The original scenario uses a specific person as an example.

However, the actual application should work for any person.

Therefore, the registration flow asks for:

```text
Name
Email
Password
```

The name is stored with the user and returned by the authentication API.

The dashboard can then display:

```text
Good morning, Keshav.
Let's keep the streak alive.
```

instead of hardcoding a specific person's name.

This makes the product reusable.

---

# 6. Habit Scheduling

Habits contain scheduling information.

A daily habit is available on:

```text
Sunday
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
```

A weekly habit can specify selected weekdays.

For example:

```text
Meditate
Sunday only
```

The dashboard checks the current weekday and only displays habits scheduled for that day.

This prevents the user from being shown irrelevant habits.

---

# 7. Completion Tracking

A completion is associated with:

```text
user
habit
date
```

Conceptually:

```text
{
    userId,
    habitId,
    date
}
```

For example:

```text
userId: u1
habitId: h3
date: 2026-09-16
```

means that the user completed habit `h3` on September 16, 2026.

This date-based approach is important because streaks depend on consecutive dates.

---

# 8. Current Streak

The current streak represents consecutive successful scheduled completions leading up to the relevant day.

Conceptually:

```text
Today       ✓
Yesterday   ✓
2 days ago  ✓
3 days ago  ✓
4 days ago  ✗
```

The current streak is:

```text
4
```

The calculation should walk backwards through the relevant scheduled dates until it encounters a missing completion.

---

# 9. Best Streak

The best streak represents the longest consecutive streak achieved by the user for that habit.

For example:

```text
Week 1: 3 days
Week 2: 7 days
Week 3: 4 days
Week 4: 5 days
```

The best streak is:

```text
7
```

Keeping both values gives the user immediate feedback:

```text
Current: 5
Best:    7
```

This makes progress more visible without requiring the user to inspect historical records manually.

---

# 10. Morning Reminder

The morning reminder was added because the application should not only record behavior but also help the user remember unfinished habits.

The logic is:

```text
Start Dashboard
       ↓
Determine today's date
       ↓
Find habits scheduled for today
       ↓
Find today's completed habits
       ↓
Compare the two
       ↓
Find incomplete habits
```

If there are pending habits:

```text
Morning check-in

You still have 3 habits to log today.
```

If there are none:

```text
You're all caught up.

All today's habits are logged.
```

This creates a direct connection between the user's daily schedule and the application's reminder system.

---

# 11. Why Local Storage Is Used for the Reminder

The application has no database.

The reminder therefore uses browser `localStorage` to remember whether the morning reminder has already been triggered for the current day.

Conceptually:

```text
75_reset_morning_reminder-2026-09-16
```

is used as a daily key.

This prevents repeatedly showing the same browser notification every time the dashboard renders.

The actual habit completion data remains on the Express server's in-memory store.

---

# 12. Browser Notification Limitation

A normal webpage cannot guarantee that JavaScript will execute at exactly 8:00 AM when the website is completely closed.

Therefore, the implementation uses a practical browser-based approach:

```text
User opens app in morning
          ↓
Application checks pending habits
          ↓
Browser notification is triggered if permission exists
```

This avoids pretending that a normal React page can provide guaranteed operating-system scheduling.

For a production implementation, scheduled notifications could be implemented using:

* Service Workers
* Web Push
* Push API
* Firebase Cloud Messaging
* Native mobile notifications
* A backend notification scheduler

---

# 13. UI Design Decisions

The application uses a professional dark SaaS visual language.

The design uses:

* Dark charcoal backgrounds
* Subtle gradients
* Glass-like panels
* Thin borders
* Large typography
* Generous spacing
* Muted secondary text
* Bright accent colors for progress

The goal is to make the application feel like a polished productivity product rather than a basic CRUD dashboard.

---

# 14. 3D Interaction

The application uses CSS 3D transforms for habit cards.

When the pointer moves across a card, its position is used to calculate:

```text
rotateX
rotateY
```

The card is then transformed using:

```css
perspective()
rotateX()
rotateY()
translateY()
scale()
```

This creates a subtle depth effect.

The animation is intentionally restrained.

The objective is to make the interface feel interactive without sacrificing usability.

---

# 15. Animated Progress Orb

The 75-day progress section uses animated rings around the progress value.

The rings use:

```css
transform: rotateX(...)
transform: rotateZ(...)
```

and CSS keyframe animations.

The progress visualization communicates the challenge concept without requiring a complicated charting library.

---

# 16. Micro-Interactions

Small animations are used throughout the interface:

* Card entrance animations
* Hover elevation
* 3D card tilt
* Progress animation
* Button hover movement
* Background ambient movement
* Completion state changes
* Notification/reminder entrance

These interactions provide visual feedback when the user interacts with the application.

---

# 17. Search

The habit list can become long during a 75-day challenge.

Therefore, search is performed on the displayed habit collection.

For example, entering:

```text
work
```

can quickly locate:

```text
Workout
```

This reduces the amount of scrolling required as the number of habits grows.

---

# 18. Component-Based Design

The UI is separated into logical components instead of placing the entire application inside one component.

For example:

```text
Dashboard
 ├── Navbar
 ├── ProgressOrb
 ├── StatsCard
 ├── HabitCard
 │     ├── Completion Button
 │     ├── Streak Information
 │     └── Actions
 └── HabitModal
```

This makes individual pieces easier to understand, test, and modify.

---

# 19. Responsive Design

The application is designed for both desktop and mobile screens.

On smaller screens:

* Dashboard columns become vertical.
* Search expands to available width.
* Habit actions move below the main habit information.
* Navigation information is simplified.
* Modal content remains within the viewport.

This is important because habit tracking is likely to happen from a phone as well as a desktop.

---

# 20. Accessibility and Reduced Motion

The project includes:

```css
@media (prefers-reduced-motion: reduce)
```

When a user has requested reduced motion at the operating-system/browser level, animations are significantly reduced.

This is important because the application intentionally uses many animations and should still remain comfortable for users who prefer less motion.

---

# 21. Error Handling

The frontend displays errors returned by the backend instead of silently failing.

For example:

```text
Could not create your account.
```

or:

```text
Could not sign you in.
```

The browser console and Network panel can also be used during development to diagnose API problems.

---

# 22. Main Design Trade-offs

There are several intentional trade-offs in this implementation.

### In-memory storage

Advantage:

```text
Simple
No database setup
Easy evaluation
```

Disadvantage:

```text
Data disappears after server restart
```

### Browser morning reminder

Advantage:

```text
No notification backend required
No database required
Simple implementation
```

Disadvantage:

```text
Cannot guarantee a notification when the website is completely closed
```

### CSS animations

Advantage:

```text
No heavy animation dependency
Fast
Customizable
```

Disadvantage:

```text
Complex 3D animation requirements would eventually benefit from a specialized animation library
```

---

# 23. Overall Architecture

The final architecture is intentionally simple:

```text
                 ┌─────────────────────┐
                 │       User          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │                     │
                 │ Dashboard           │
                 │ Habit Cards         │
                 │ Search              │
                 │ Reminder UI         │
                 │ Progress            │
                 └──────────┬──────────┘
                            │ Axios / HTTP
                            ▼
                 ┌─────────────────────┐
                 │   Express Server    │
                 │                     │
                 │ Auth Routes         │
                 │ Habit Routes        │
                 │ Streak Logic        │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ In-Memory Store     │
                 │                     │
                 │ Users               │
                 │ Habits              │
                 │ Completions         │
                 └─────────────────────┘

Browser localStorage
        │
        └── Morning reminder state
```

---

# 24. Result

The resulting application focuses on the core behavior of a 75-day habit challenge:

```text
Create habits
     ↓
See today's habits
     ↓
Complete them
     ↓
Protect the streak
     ↓
Receive morning reminders
     ↓
Monitor 75-day progress
```

The implementation keeps the architecture simple enough for evaluation while providing a polished, personalized, animated user experience.
