import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export default function PetViewer({ user }) {
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

  if (!user) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>View Pets</h2>
        <p>Please log in to view your pets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>View Pets</h2>
        <p>Loading pets…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>View Pets</h2>
      {pets.length === 0 ? (
        <p>You haven&apos;t added any pets yet.</p>
      ) : (
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
                background: "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 4px" }}>{pet.name}</h3>
              <small>
                {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
              </small>
              {pet.age && (
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                  Age: {pet.age}
                </p>
              )}
              <p style={{ marginTop: 8 }}>
                {pet.notes || "No notes yet for this pet."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
