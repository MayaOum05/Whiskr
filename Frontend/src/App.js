// src/App.js
import "./App.css";
import Navbar from "./components/Navbar";
import AuthGate from "./components/AuthGate";

function App() {
  return (
    <AuthGate>
      <Navbar />
      {/* Main Whiskr dashboard / routes will go here */}
      <div style={{ padding: "1rem" }}>
        <h1>Whiskr 🐾</h1>
        <p>Welcome to your pet health dashboard.</p>
      </div>
    </AuthGate>
  );
}

export default App;
