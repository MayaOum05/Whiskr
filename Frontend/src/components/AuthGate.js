import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
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
      setError(err.message || "Something went wrong");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (checking) {
    return <p style={{ padding: "1rem" }}>Checking login…</p>;
  }

  // If not logged in, show auth form
  if (!user) {
    return (
      <div style={{ padding: "1rem", maxWidth: 400 }}>
        <h2>{mode === "login" ? "Log in" : "Sign up"}</h2>
        {error && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </label>
          </div>
          <button type="submit">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          style={{ marginTop: "0.5rem" }}
          onClick={() =>
            setMode((m) => (m === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    );
  }

  // 🔑 HERE: when logged in, call children as a function and give it `user`
  if (typeof children === "function") {
    return children(user, { onLogout: handleLogout });
  }

  // fallback (if you ever use it without a function child)
  return children;
}
