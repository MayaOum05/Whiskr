import "./PetsDashboard.css";

export default function PetsDashboard({ user }) {
  console.log("PetsDashboard mounted. user =", user);

  if (!user) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>No user</h1>
        <p>PetsDashboard is rendering, but no user was passed in.</p>
      </div>
    );
  }

  return (
    <main className="pet-dashboard">
      <h1>Pet Dashboard Test</h1>

      <section className="health-section">
        <h2>Pet Health Overview</h2>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Appointments</h3>
            <p>Test: this is the appointments card.</p>
          </div>

          <div className="card">
            <h3>Search Nearby Vets &amp; Groomers</h3>
            <p>Test: this is the search card.</p>
          </div>

          <div className="card">
            <h3>Medicine List</h3>
            <p>Test: this is the medicine list card.</p>
          </div>

          <div className="card">
            <h3>Medical History &amp; Doctor&apos;s Notes</h3>
            <p>Test: this is the history/notes card.</p>
          </div>
        </div>
      </section>

      <button className="chat-fab" aria-label="Open AI Chat">
        💬
      </button>
    </main>
  );
}

