export default function Navbar({ onShowPets, onShowAddPet }) {
  return (
    <nav>
      <h2>Whiskr</h2>
      <div>
        <a href="#PetsDashboard">Pets</a>
        <a href="#Appointments">Appointments</a>
        <a href="#Medication">Medication</a>
        <a href="#Donate">Donate</a>
      </div>
    </nav>
  );
}
