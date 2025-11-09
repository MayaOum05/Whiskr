import { useState } from "react";
import "./NearbyServices.css"; // optional CSS styling file

export default function NearbyServices() {
  const [zip, setZip] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(`/api/nearby?zip=${zip}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to fetch nearby services.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nearby-container">
      <h1 className="title">Find Nearby Vets & Groomers</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          required
          className="zip-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading && <p className="loading">Searching nearby services...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.length > 0 &&
          results.map((place, i) => (
            <div className="place-card" key={i}>
              <h3>{place.name}</h3>
              <p>{place.address}</p>
              <p>⭐ {place.rating || "No rating"} ({place.reviews || 0} reviews)</p>
              <p>💰 Avg. price: {place.price}</p>

              {/* Placeholder for future Gemini AI summary */}
              <p className="ai-summary">
                🧠 AI Summary: (coming soon)
              </p>
            </div>
          ))}

        {!loading && results.length === 0 && !error && (
          <p className="empty-state">Enter a ZIP code to see nearby services.</p>
        )}
      </div>
    </div>
  );
}
