// src/components/PetDashboard.js (or src/PetDashboard.js, match your path)
import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

import AppointmentCalendar from "./AppointmentCalendar";
import "./PetsDashboard.css";

export default function PetsDashboard({ user }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);

  // Load all pets for user
  useEffect(() => {
    if (!user) return;

    const petsRef = collection(db, "users", user.uid, "pets");
    const qPets = query(petsRef);

    const unsub = onSnapshot(
      qPets,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPets(items);

        // Default to first pet if none selected yet
        if (!selectedPet && items.length > 0) {
          setSelectedPet(items[0]);
        }
      },
      (err) => {
        console.error("Error loading pets:", err);
      }
    );

    return () => unsub();
  }, [user]);

  // Load medical history for selected pet
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

    const unsub = onSnapshot(
      qHistory,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setHistory(items);
      },
      (err) => {
        console.error("Error loading medical history:", err);
      }
    );

    return () => unsub();
  }, [user, selectedPet]);

  if (!user) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>No user</h1>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>No pets found yet.</h2>
        <p>Add a pet from the “Pets → Add Pet” menu.</p>
      </div>
    );
  }

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
    // TODO: later send these to your backend/Gemini for analysis
  };

  return (
    <main className="pet-dashboard">
      <section className="health-section">
        <div className="dashboard-header">
          <h1 className="dash-title">
            {selectedPet
              ? `${selectedPet.name}'s Health Overview`
              : "Pet Health Overview"}
          </h1>

          {/* Pet Switcher */}
          <div className="pet-switcher">
            <label htmlFor="pet-select">Switch Pet:</label>
            <select
              id="pet-select"
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
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className="dashboard-grid">
          <div className="card">
            <AppointmentCalendar pet={selectedPet} user={user} />
          </div>

          <div className="card">
            <h3>Search Nearby Vets &amp; Groomers</h3>
            <p>Find care providers close to you.</p>
          </div>

          <div className="card">
            <h3>Medicine List</h3>
            <p>Track medications, dosages, and schedules.</p>
          </div>

          <div className="card card-history">
            <h3>Medical History &amp; Doctor&apos;s Notes</h3>

            {history.length === 0 ? (
              <p className="history-empty">
                No medical history yet for this pet. Add entries from the Pets
                tab or upload vet records below.
              </p>
            ) : (
              <ul className="history-list">
                {history.slice(0, 3).map((entry) => (
                  <li key={entry.id} className="history-item">
                    <div className="history-row">
                      <span className="history-date">
                        {entry.date || "No date"}
                      </span>
                      <span className="history-title">
                        {entry.title || "Visit / Note"}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="history-notes">{entry.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Upload area */}
            <div className="history-upload">
              <label className="upload-label">
                Upload records (PDF, images)
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFilesChange}
                />
              </label>
              <p className="upload-helper">
                These files will be analyzed by Fleabie the AI Assistant to
                 analyze and simplify medical notes (feature coming soon).
              </p>

              {uploadFiles.length > 0 && (
                <ul className="upload-file-list">
                  {uploadFiles.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <button className="chat-fab" aria-label="Open AI Chat">
        💬
      </button>
    </main>
  );
}
