// src/components/PetHistory.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function PetHistory({ user }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [history, setHistory] = useState([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // load pets
  useEffect(() => {
    if (!user) return;

    const petsRef = collection(db, "users", user.uid, "pets");
    const qPets = query(petsRef);

    const unsub = onSnapshot(qPets, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPets(items);

      if (!selectedPet && items.length > 0) {
        setSelectedPet(items[0]);
      }
    });

    return () => unsub();
  }, [user, selectedPet]);

  // load history for selected pet
  useEffect(() => {
    if (!user || !selectedPet) {
      setHistory([]);
      return;
    }

    const historyRef = collection(
      db,
      "users",
      user.uid,
      "pets",
      selectedPet.id,
      "medicalHistory"
    );
    const qHistory = query(historyRef, orderBy("date", "desc"));

    const unsub = onSnapshot(qHistory, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setHistory(items);
    });

    return () => unsub();
  }, [user, selectedPet]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!user || !selectedPet || !title.trim()) return;

    try {
      setSaving(true);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const historyRef = collection(
        db,
        "users",
        user.uid,
        "pets",
        selectedPet.id,
        "medicalHistory"
      );

      await addDoc(historyRef, {
        title: title.trim(),
        notes: notes.trim(),
        date: today,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setNotes("");
    } catch (err) {
      console.error("Error adding history entry:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Pet History</h2>
        <p>Please log in to view medical history.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Pet History</h2>

      {pets.length > 0 && (
        <div style={{ margin: "0.5rem 0 1rem" }}>
          <label>
            Select pet:{" "}
            <select
              value={selectedPet?.id || ""}
              onChange={(e) => {
                const found = pets.find((p) => p.id === e.target.value);
                setSelectedPet(found || null);
              }}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!selectedPet && <p>Add a pet first to view history.</p>}

      {selectedPet && (
        <>
          <form onSubmit={handleAddEntry} style={{ marginBottom: "1rem" }}>
            <h3>Add History Entry</h3>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 4 }}
                  placeholder="Wellness exam, vaccination, diagnosis, etc."
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 4 }}
                  rows={3}
                  placeholder="Key findings, vet recommendations, medications..."
                />
              </label>
            </div>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </form>

          <h3>History for {selectedPet.name}</h3>
          {history.length === 0 ? (
            <p>No history entries yet.</p>
          ) : (
            <ul style={{ paddingLeft: "1.25rem" }}>
              {history.map((entry) => (
                <li key={entry.id} style={{ marginBottom: "0.5rem" }}>
                  <strong>{entry.date || "No date"}</strong> —{" "}
                  {entry.title || "Visit / Note"}
                  {entry.notes && (
                    <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>
                      {entry.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
