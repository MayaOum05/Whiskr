import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 1rem" }}>
          <div>Logged in as: <strong>{user.email}</strong></div>
          <button onClick={handleLogout}>Log out</button>
        </div>
        {children}
      </div>
    );
  }

  // If not logged in, show auth form
  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "1.5rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {mode === "login" ? "Log in to Whiskr" : "Create your Whiskr account"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        >
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
            >
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
