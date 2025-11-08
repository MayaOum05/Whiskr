import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export default function AddPetForm({ user, onPetCreated }) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Cat");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const petsRef = collection(db, "users", user.uid, "pets");
      await addDoc(petsRef, {
        name,
        species,
        breed,
        birthday: birthday || null,
        notes,
        createdAt: serverTimestamp(),
      });

      // reset form
      setName("");
      setSpecies("Cat");
      setBreed("");
      setBirthday("");
      setNotes("");

      if (onPetCreated) onPetCreated();
    } catch (err) {
      console.error(err);
      setError("Failed to save pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1rem",
        background: "white",
      }}
    >
      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Pet Name
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Species
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: 4 }}
          >
            <option>Cat</option>
            <option>Dog</option>
            <option>Bird</option>
            <option>Reptile</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Breed (optional)
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Birthday (optional)
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Notes (meds, conditions, etc.)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", marginTop: 4 }}
          />
        </label>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: "0.5rem" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Saving…" : "Save Pet"}
      </button>
    </form>
  );
}
