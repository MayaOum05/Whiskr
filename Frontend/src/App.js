import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  const [session, setSession] = useState(null);

  return (
    <div className="App">
      <Navbar />
    
    </div>
  );
}

export default App;
