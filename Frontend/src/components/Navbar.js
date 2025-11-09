import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({
  user,
  onLogout,
  onShowDashboard,
  onShowAddPet,
  onShowViewPets,
  onShowPetHistory,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [petsOpen, setPetsOpen] = useState(false);

  const toggleProfile = () => {
    setProfileOpen((o) => !o);
    setPetsOpen(false);
  };

  const togglePets = () => {
    setPetsOpen((o) => !o);
    setProfileOpen(false);
  };

  const handleNavClick = (fn) => {
    if (fn) fn();
    setPetsOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={onShowDashboard} style={{ cursor: "pointer" }}>
        <span className="nav-logo-icon">
          <img alt="whiskr logo" src="whiskr_icon.png" />
        </span>
        <span className="nav-logo-text">Whiskr</span>
      </div>

      <ul className="navbar-links">
        <li className="pets-tab">
          <button className="nav-link pets-button" onClick={togglePets}>
            Pets ▾
          </button>
          {petsOpen && (
            <div className="pets-dropdown">
              <button
                className="dropdown-item"
                onClick={() => handleNavClick(onShowAddPet)}
              >
                Add Pet
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleNavClick(onShowViewPets)}
              >
                View Pets
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleNavClick(onShowPetHistory)}
              >
                Pet History
              </button>
            </div>
          )}
        </li>

        
        <li className="profile-tab">
          <button
            className="nav-link profile-button"
            onClick={toggleProfile}
          >
            Profile ▾
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-email">{user?.email}</div>
              <button className="logout-button" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}
        </li>

        <li>
          <button className="nav-link">Appointments</button>
        </li>
        <li>
          <button className="nav-link">Medication</button>
        </li>
        <li>
          <button className="nav-link">
            About
          </button>
        </li>
        <li>
          <button  className="nav-link">Donate</button>
        </li>

      </ul>
    </nav>
  );
}
