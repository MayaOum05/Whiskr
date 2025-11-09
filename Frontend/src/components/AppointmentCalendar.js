import { useState } from 'react';

export default function AppointmentCalendar({ userEmail }) {
    const [appointments, setAppointments] = useState([]);

    const [form, setForm] = useState( { id: null, pet: "", title: "", date: "", time: "" });
    
    const [editing, setEditing] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.balue });

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pet || !form.title || !form.date || !form.time) return;

    let newAppt = { ...form, id: form.id || Date.now() };
    const updated = editing
      ? appointments.map(a => a.id === form.id ? newAppt : a)
      : [...appointments, newAppt];
    setAppointments(updated);
    setForm({ id: null, pet: "", title: "", date: "", time: "" });
    setEditing(false);

    const dt = new Date(`${newAppt.date}T${newAppt.time}`);
    const sendAt = new Date(dt.getTime() - 12 * 60 * 60 * 1000);
    if (userEmail)
      fetch("/api/schedule-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...newAppt, sendAt }),
      }).catch(console.error);
  };

  const editAppt = (a) => { setForm(a); setEditing(true); };
  const delAppt = (id) => setAppointments(appointments.filter(a => a.id !== id));

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Whiskr Appointments</h3>
      <form onSubmit={handleSubmit}>
        <input name="pet" value={form.pet} onChange={handleChange} placeholder="Pet Name" />
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input type="time" name="time" value={form.time} onChange={handleChange} />
        <button type="submit">{editing ? "Update" : "Add"}</button>
      </form>

      <ul>
        {appointments.map((a) => (
          <li key={a.id}>
            {a.pet} - {a.title} @ {a.date} {a.time}{" "}
            <button onClick={() => editAppt(a)}>✏️</button>
            <button onClick={() => delAppt(a.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}