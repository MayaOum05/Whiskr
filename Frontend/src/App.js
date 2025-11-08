import "./App.css";
import Navbar from "./components/Navbar";
import AuthGate from "./components/AuthGate";
import PetsDashboard from "./components/PetsDashboard";

function App() {
  return (
    <AuthGate>
      <Navbar />
      <PetsDashboard />
    </AuthGate>
  );
}

export default App;
