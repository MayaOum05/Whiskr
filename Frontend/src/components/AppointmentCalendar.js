import { useState } from "react";

export default function AppointmentCalendar({ userEmail }) {
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({
    id: null,
    pet: "",
    title: "",
    date: "",
    time: "",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target; // <-- FIXED HERE
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pet || !form.title || !form.date || !form.time) return;

    // preserve "done" when editing
    const existing = appointments.find((a) => a.id === form.id);
    const newAppt = {
      ...form,
      id: form.id || Date.now(),
      done: existing?.done ?? false,
    };

    const updated = editing
      ? appointments.map((a) => (a.id === form.id ? newAppt : a))
      : [...appointments, newAppt];

    setAppointments(updated);
    setForm({ id: null, pet: "", title: "", date: "", time: "" });
    setEditing(false);

    // Schedule reminder 12 hours before
    const dt = new Date(`${newAppt.date}T${newAppt.time}`);
    const sendAt = new Date(dt.getTime() - 12 * 60 * 60 * 1000);

    if (userEmail) {
      fetch("/api/schedule-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          ...newAppt,
          sendAt: sendAt.toISOString(), // safer than sending Date object
        }),
      }).catch(console.error);
    }
  };

  const editAppt = (appt) => {
    setForm({
      id: appt.id,
      pet: appt.pet,
      title: appt.title,
      date: appt.date,
      time: appt.time,
    });
    setEditing(true);
  };

  const delAppt = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleDone = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, done: !a.done } : a
      )
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Whiskr Appointments</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          name="pet"
          value={form.pet}
          onChange={handleChange}
          placeholder="Pet Name"
        />
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Appointment Title"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
        />
        <button type="submit">
          {editing ? "Update Appointment" : "Add Appointment"}
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {appointments.map((a) => (
          <li
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              checked={!!a.done}
              onChange={() => toggleDone(a.id)}
            />
            <span
              style={{
                textDecoration: a.done ? "line-through" : "none",
                flex: 1,
              }}
            >
              <strong>{a.pet}</strong> – {a.title} @ {a.date} {a.time}
            </span>
            <button type="button" onClick={() => editAppt(a)}>
              ✏️
            </button>
            <button type="button" onClick={() => delAppt(a.id)}>
              🗑️
            </button>
          </li>
        ))}
        {appointments.length === 0 && <li>No appointments yet.</li>}
      </ul>
    </div>
  );
}
