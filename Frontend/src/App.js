import React, { useState } from "react";
import "./App.css";
import AuthGate from "./components/AuthGate";
import Navbar from "./components/Navbar";
import PetsDashboard from "./components/PetsDashboard";
import AddPetForm from "./components/AddPetForm";
import PetViewer from "./components/PetViewer";
import PetHistory from "./components/PetHistory";

export default function App() {
  const [activePetView, setActivePetView] = useState("dashboard"); 

  return (
    <AuthGate>
      {(user, { onLogout }) => (
        <>
          <Navbar
            user={user}
            onLogout={onLogout}
            onShowDashboard={() => setActivePetView("dashboard")}
            onShowAddPet={() => setActivePetView("add")}
            onShowViewPets={() => setActivePetView("view")}
            onShowPetHistory={() => setActivePetView("history")}
          />

          {activePetView === "dashboard" && <PetsDashboard user={user} />}
          {activePetView === "add" && <AddPetForm user={user} />}
          {activePetView === "view" && <PetViewer user={user} />}
          {activePetView === "history" && <PetHistory user={user} />}          
        </>
      )}
    </AuthGate>
  );
}
