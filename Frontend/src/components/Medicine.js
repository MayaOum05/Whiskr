import { useState } from "react";

export default function Medicine() {
  const [meds, setMeds] = useState([]);

  const [form, setForm] = useState({
    id: null,
    pet: "",
    name: "",
    dosage: "",
    frequency: "",
    notes: "",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Require at least pet + med name
    if (!form.pet || !form.name) return;

    const existing = meds.find((m) => m.id === form.id);
    const newMed = {
      ...form,
      id: form.id || Date.now(),
      done: existing?.done ?? false,
    };

    const updated = editing
      ? meds.map((m) => (m.id === form.id ? newMed : m))
      : [...meds, newMed];

    setMeds(updated);
    setForm({
      id: null,
      pet: "",
      name: "",
      dosage: "",
      frequency: "",
      notes: "",
    });
    setEditing(false);
  };

  const editMed = (med) => {
    setForm({
      id: med.id,
      pet: med.pet,
      name: med.name,
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      notes: med.notes || "",
    });
    setEditing(true);
  };

  const delMed = (id) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleDone = (id) => {
    setMeds((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, done: !m.done } : m
      )
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Whiskr Medications</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            name="pet"
            value={form.pet}
            onChange={handleChange}
            placeholder="Pet Name"
          />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Medication Name"
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="Dosage (e.g. 5mg)"
          />
          <input
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            placeholder="Frequency (e.g. 2x/day)"
          />
        </div>

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (e.g. with food, monitor side effects)"
          rows={2}
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />

        <button type="submit">
          {editing ? "Update Medication" : "Add Medication"}
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {meds.map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              checked={!!m.done}
              onChange={() => toggleDone(m.id)}
            />

            <div
              style={{
                textDecoration: m.done ? "line-through" : "none",
                flex: 1,
              }}
            >
              <strong>{m.pet}</strong> – {m.name}
              {m.dosage && <> • {m.dosage}</>}
              {m.frequency && <> • {m.frequency}</>}
              {m.notes && (
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  {m.notes}
                </div>
              )}
            </div>

            <button type="button" onClick={() => editMed(m)}>
              ✏️
            </button>
            <button type="button" onClick={() => delMed(m.id)}>
              🗑️
            </button>
          </li>
        ))}

        {meds.length === 0 && <li>No medications added yet.</li>}
      </ul>
    </div>
  );
}
