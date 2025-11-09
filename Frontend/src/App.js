import "./App.css";
import AuthGate from "./components/AuthGate";
import PetsDashboard from "./components/PetsDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <AuthGate>
      {(user, { onLogout }) => (
        <>
          <Navbar user={user} onLogout={onLogout} />
          <PetsDashboard user={user} />
        </>
      )}
    </AuthGate>
  );
}
