<<<<<<< HEAD
# 75 / RESET — 75-Day Habit Challenge

A professional, animated habit-tracking web application built with **React, Node.js, and Express.js**.

The application helps users complete a 75-day improvement challenge by tracking daily and weekly habits, monitoring streaks, searching habits, and receiving morning reminders for habits that have not yet been logged.

> **Important:** This project intentionally does **not** use MongoDB or any other database. Application data is stored in memory on the Express server.

---

## Features

### Personalized User Experience

* Users can enter their own name while registering.
* The dashboard greets the user using their name.
* Users are not limited to the original example user.

### Habit Management

Users can:

* Add new habits
* Edit existing habits
* Delete habits
* Mark habits as completed
* Unmark completed habits
* Search through their habit list
* Configure habits as daily or weekly
* Select specific days for weekly habits

### Streak Tracking

For every habit, the application tracks:

* Current streak
* Best streak
* Today's completion status

The dashboard also provides overall progress for the 75-day challenge.

### 75-Day Progress

The dashboard includes:

* Current challenge day
* Overall completion percentage
* Today's completed habits
* Longest streak
* Momentum/progress indicators
* Animated 75-day progress visualization

### Morning Reminder

Every morning, the application checks which scheduled habits have not yet been completed.

The dashboard displays a reminder such as:

> Morning check-in — You still have 3 habits to log today.

The user can also enable browser notifications.

If all scheduled habits are completed, the reminder changes to:

> You're all caught up — All today's habits are logged.

The reminder state is stored in browser `localStorage`, so no database is required.

### Professional UI

The interface includes:

* Dark premium SaaS-style theme
* Glassmorphism
* Subtle gradients
* Animated background effects
* 3D habit-card hover effects
* Animated progress orb
* Micro-interactions
* Smooth transitions
* Responsive mobile design
* Reduced-motion accessibility support

---

# Technology Stack

## Frontend

* React
* React Router
* Axios
* CSS
* CSS animations and 3D transforms

## Backend

* Node.js
* Express.js
* REST API

## Storage

No database is used.

Data is stored in:

```text
server/data/store.js
```

Because the data is stored in memory, restarting the backend will reset the application's data.

---

# Project Structure

```text
75-day-habit-challenge/
│
├── README.md
├── REASONING.md
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HabitCard.jsx
│   │   │   ├── HabitModal.jsx
│   │   │   ├── ProgressOrb.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   └── styles.css
│   │
│   └── package.json
│
└── server/
    ├── data/
    │   └── store.js
    │
    ├── routes/
    │   ├── auth.js
    │   └── habits.js
    │
    ├── server.js
    └── package.json
```

---

# Requirements

Install the following before running the project:

* Node.js 18 or newer
* npm
* Git

Check your versions:

```bash
node --version
npm --version
git --version
```

---

# Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd 75-day-habit-challenge
```

---

# Backend Setup

Open a terminal:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

If the project does not contain a development script, use:

```bash
node server.js
```

The backend will normally run on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal.

From the project root:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start React:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

Open that address in your browser.

---

# Application Flow

The basic flow is:

```text
User
  ↓
Register
  ↓
Enter Name
  ↓
Create Account
  ↓
Dashboard
  ↓
Today's Habits
  ↓
Complete Habits
  ↓
Streak Calculation
  ↓
75-Day Progress
```

The morning reminder works like:

```text
Open Dashboard in Morning
          ↓
Find Today's Scheduled Habits
          ↓
Compare With Today's Completions
          ↓
       Pending?
       /      \
     Yes       No
      ↓         ↓
 Reminder    All Caught Up
      ↓
 Optional Browser Notification
```

---

# Morning Reminder Details

The application considers the morning period to be:

```text
06:00 AM – 11:59 AM
```

When the dashboard is opened during this period, the application checks today's pending habits.

For example, suppose today's habits are:

```text
✓ Drink Water
✓ Read
○ Workout
○ Meditate
```

The application will show:

```text
Morning check-in

You still have 2 habits to log today.
```

If notifications have been allowed by the browser, a notification can also be displayed.

---

# Browser Notification Permission

The first time the user wants browser notifications, they need to click:

```text
Enable morning notifications
```

The browser will ask for permission.

Select:

```text
Allow
```

Notifications are subject to browser permissions and browser support.

---

# Important Reminder Limitation

A normal web application cannot reliably execute JavaScript at an exact time if the website has been completely closed.

Therefore, this implementation triggers the morning reminder when the application is opened during the morning.

For true scheduled notifications even when the application is closed, a production implementation could use:

* Progressive Web App capabilities
* Service Workers
* Web Push
* Firebase Cloud Messaging
* A mobile application
* A backend scheduled notification service

The current implementation intentionally keeps the project simple and database-free.

---

# API Overview

## Authentication

### Register

```http
POST /api/auth/register
```

Example body:

```json
{
  "name": "Keshav",
  "email": "keshav@example.com",
  "password": "Password@123"
}
```

### Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "keshav@example.com",
  "password": "Password@123"
}
```

---

## Habits

### Get habits

```http
GET /api/habits
```

### Create habit

```http
POST /api/habits
```

### Update habit

```http
PUT /api/habits/:id
```

### Delete habit

```http
DELETE /api/habits/:id
```

### Toggle habit

```http
PATCH /api/habits/:id/toggle
```

Example:

```json
{
  "date": "2026-09-16"
}
```

---

# Debugging

## Backend does not start

Check Node.js:

```bash
node --version
```

Then reinstall dependencies:

```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

On Windows PowerShell, you can remove `node_modules` manually if necessary.

---

## Frontend does not start

Run:

```bash
cd client
npm install
npm run dev
```

Check that the terminal shows the Vite development URL.

---

## API requests fail

Make sure both servers are running:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

Check the browser's Developer Tools:

```text
F12 → Console
```

and:

```text
F12 → Network
```

Look for failed API requests.

---

## Morning notification does not appear

Check:

1. The browser supports notifications.
2. Notification permission is set to `Allow`.
3. The application is opened between 06:00 and 11:59.
4. There are incomplete habits scheduled for today.
5. The reminder has not already been triggered for the current day.

Browser notification permissions can be checked from the browser's site settings.

---

# No Database

This project intentionally does not contain:

```text
MongoDB
Mongoose
PostgreSQL
MySQL
Firebase Database
```

All server-side application data is maintained in:

```text
server/data/store.js
```

Therefore:

> Restarting the Express server resets the data.

This is intentional for the requirements of this project.

---

# Demo Account

The initial demo account is:

```text
Email: alex@example.com
Password: Password@123
```

A new user can also register with their own name and credentials.

---

# Accessibility

The UI includes support for:

```css
prefers-reduced-motion
```

Users who prefer reduced motion will receive a less animated experience.

---

# Production Considerations

This project is designed as an evaluation/demo application.

For a production application, the following improvements would be recommended:

* Persistent database
* Secure password hashing
* JWT/session authentication
* Input validation
* Rate limiting
* HTTPS
* Production logging
* Automated tests
* Real push notification infrastructure
* Persistent user accounts
* Cloud deployment
* Error monitoring

These are intentionally outside the scope of the current no-database implementation.

---

# License

This project is created for educational and evaluation purposes.
=======
# Assessment
Online Assessment Test
>>>>>>> c21d0f39e194562d50d282201dd1de2fc4c8e3b9
