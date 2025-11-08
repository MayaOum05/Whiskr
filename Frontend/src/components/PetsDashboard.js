import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export default function PetsDashboard({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const petsRef = collection(db, "users", user.uid, "pets");
    const q = query(petsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPets(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading pets:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleToggleFavorite = async (pet) => {
    if (!user) return;
    const petRef = doc(db, "users", user.uid, "pets", pet.id);
    await updateDoc(petRef, { favorite: !pet.favorite });
  };

  const handleDelete = async (pet) => {
    if (!user) return;
    const ok = window.confirm(`Delete ${pet.name}?`);
    if (!ok) return;

    const petRef = doc(db, "users", user.uid, "pets", pet.id);
    await deleteDoc(petRef);
  };

  if (!user) return null;

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading your pets…</p>;
  }

  if (pets.length === 0) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Your Pets</h2>
        <p>No pets yet. Use “Add Pet” in the navbar to create one.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Pets</h2>
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginTop: "12px",
        }}
      >
        {pets.map((pet) => (
          <div
            key={pet.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: "0.75rem",
            }}
          >
            <h3 style={{ margin: "0 0 4px" }}>{pet.name}</h3>
            <small>
              {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
            </small>
            <p style={{ marginTop: 8 }}>
              {pet.notes || "No notes yet for this pet."}
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => handleToggleFavorite(pet)}>
                {pet.favorite ? "★ Favorited" : "☆ Favorite"}
              </button>
              <button
                onClick={() => handleDelete(pet)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
