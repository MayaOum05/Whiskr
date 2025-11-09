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

import FleabieChat from './FleabieChat';

export default function PetsDashboard({ user }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);

  const [zip, setZip] = useState("");
  const [nearbyResults, setNearbyResults] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  const [showChat, setShowChat] = useState(false);


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

  const handleNearbySearch = async (e) => {
    e.preventDefault();
    setNearbyError("");
    setNearbyResults([]);

    if (!zip) {
      setNearbyError("Please enter a ZIP code.");
      return;
    }

    setNearbyLoading(true);
    try {
      const res = await fetch(`/api/nearby?zip=${encodeURIComponent(zip)}`);
      const data = await res.json();

      if (!res.ok) {
        setNearbyError(data.error || "Something went wrong searching nearby services.");
      } else {
        setNearbyResults(data);
      }
    } catch (err) {
      console.error("Nearby search error:", err);
      setNearbyError("Failed to fetch nearby services.");
    } finally {
      setNearbyLoading(false);
    }
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

        <div className="dashboard-grid">
          <div className="card">
            <AppointmentCalendar pet={selectedPet} user={user} />
          </div>

          <div className="card">
            <h3>Search Nearby Vets &amp; Groomers</h3>
            <p>Find care providers close to you.</p>

            <form className="nearby-form" onSubmit={handleNearbySearch}>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Enter ZIP code"
                className="nearby-zip-input"
                required
              />
              <button type="submit" className="nearby-search-btn">
                Search
              </button>
            </form>

            {nearbyLoading && (
              <p className="nearby-status">Searching nearby services…</p>
            )}
            {nearbyError && (
              <p className="nearby-error">{nearbyError}</p>
            )}

            {!nearbyLoading && !nearbyError && nearbyResults.length === 0 && zip && (
              <p className="nearby-status">
                No results found yet — try a different ZIP or radius later.
              </p>
            )}

            {nearbyResults.length > 0 && (
              <ul className="nearby-results">
                {nearbyResults.map((place, idx) => (
                  <li key={idx} className="nearby-place">
                    <div className="nearby-place-header">
                      <strong>{place.name}</strong>
                      {place.rating && (
                        <span className="nearby-rating">
                          ⭐ {place.rating} ({place.reviews || 0} reviews)
                        </span>
                      )}
                    </div>
                    <p className="nearby-address">{place.address}</p>
                    <p className="nearby-price">
                      💰 Avg. price: {place.price || "N/A"}
                    </p>
                    <p className="nearby-ai">
                      🧠 AI Summary: (Gemini-powered summary coming soon)
                    </p>
                  </li>
                ))}
              </ul>
            )}
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

      <button
        className={`fleabie-toggle ${showChat ? "open" : ""}`}
        onClick={() => setShowChat((prev) => !prev)}
        aria-label={showChat ? "Close Fleabie chat" : "Open Fleabie chat"}
      >
        {showChat ? "✖️" : "💬"}
      </button>

      {/* Chat Panel */}
      {showChat && (
        <div className="fleabie-chat-container">
          <FleabieChat petProfile={selectedPet} />
        </div>
      )}


    </main>
  );
}
