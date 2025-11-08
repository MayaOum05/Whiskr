export default function Navbar({ onShowPets, onShowAddPet }) {
  return (
    <nav>
      <h2>Whiskr</h2>
      <div>
        <button onClick={onShowPets}>Pets</button>
      </div>
    </nav>
  );
}
