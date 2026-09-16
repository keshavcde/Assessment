import { useEffect, useState } from "react";

const DAYS = [
  ["Sun", 0],
  ["Mon", 1],
  ["Tue", 2],
  ["Wed", 3],
  ["Thu", 4],
  ["Fri", 5],
  ["Sat", 6]
];

export default function HabitModal({ habit, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    frequency: "daily",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    color: "#E8B15C"
  });

  useEffect(() => {
    setForm({
      name: habit?.name || "",
      description: habit?.description || "",
      frequency: habit?.frequency || "daily",
      weekdays: habit?.weekdays || [0, 1, 2, 3, 4, 5, 6],
      color: habit?.color || "#E8B15C"
    });
  }, [habit]);

  function toggleDay(day) {
    setForm(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day].sort()
    }));
  }

  function submit(e) {
    e.preventDefault();

    onSave({
      ...form,
      weekdays:
        form.frequency === "daily"
          ? [0, 1, 2, 3, 4, 5, 6]
          : form.weekdays
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">Habit</span>
            <h2>{habit ? "Edit habit" : "Add a habit"}</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            Name
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Journal"
              autoFocus
              required
            />
          </label>

          <label className="field">
            What counts as done
            <textarea
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              rows="3"
              placeholder="Two pages before bed."
            />
          </label>

          <label className="field">
            Frequency
            <select
              value={form.frequency}
              onChange={e =>
                setForm({ ...form, frequency: e.target.value })
              }
            >
              <option value="daily">Every day</option>
              <option value="weekly">Selected days</option>
            </select>
          </label>

          {form.frequency === "weekly" && (
            <div>
              <span className="field-title">Scheduled days</span>

              <div className="days">
                {DAYS.map(([label, day]) => (
                  <button
                    key={day}
                    type="button"
                    className={
                      form.weekdays.includes(day) ? "day selected" : "day"
                    }
                    onClick={() => toggleDay(day)}
                    aria-pressed={form.weekdays.includes(day)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="field">
            Accent colour
            <input
              type="color"
              className="color-input"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
            />
          </label>

          <button className="primary-button">
            {habit ? "Save changes" : "Create habit"}
          </button>
        </form>
      </div>
    </div>
  );
}
