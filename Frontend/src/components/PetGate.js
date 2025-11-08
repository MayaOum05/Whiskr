import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "./firebase";
import AddPetForm from "./AddPetForm";

export default function PetGate({ user, children }) {
  const [loading, setLoading] = useState(true);
  const [hasPets, setHasPets] = useState(false);

  const checkPets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const petsRef = collection(db, "users", user.uid, "pets");
      const q = query(petsRef, limit(1));
      const snapshot = await getDocs(q);
      setHasPets(!snapshot.empty);
    } catch (err) {
      console.error("Error checking pets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading your pets…</p>;
  }

  if (!hasPets) {
    return (
      <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Welcome to Whiskr 🐾</h2>
        <p style={{ marginBottom: "1rem" }}>
          Before you access your dashboard, let&apos;s add your first pet.
        </p>
        <AddPetForm user={user} onPetCreated={checkPets} />
      </div>
    );
  }

  // User has at least one pet → show the dashboard content
  return <>{children}</>;
}
