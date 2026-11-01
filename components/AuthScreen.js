"use client";

import { useState } from "react";
import { signIn, signUp } from "../lib/auth";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const action = mode === "login" ? signIn : signUp;
      const { error } = await action(email.trim(), password);

      if (error) throw error;

      if (mode === "signup") {
        setMessage("Account created! Check your email if confirmation is required, then log in.");
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#090914", color: "#fff", padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400, padding: 32, border: "1px solid #39304f", borderRadius: 18, background: "#151323" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>MY ANIME JOURNEY</h1>
        <p style={{ color: "#aaa", marginBottom: 28 }}>Your anime world, synced everywhere.</p>

        <h2 style={{ marginBottom: 20 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>

        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 13, margin: "8px 0 18px", borderRadius: 9, border: "1px solid #514768", background: "#0d0b18", color: "#fff" }} />

        <label htmlFor="auth-password">Password</label>
        <input id="auth-password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 13, margin: "8px 0 20px", borderRadius: 9, border: "1px solid #514768", background: "#0d0b18", color: "#fff" }} />

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, border: 0, borderRadius: 9, background: "#9b65ff", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </button>

        {message && <p role="status" style={{ color: "#d5c5ff", lineHeight: 1.5, marginTop: 18 }}>{message}</p>}

        <p style={{ marginTop: 22, color: "#aaa", textAlign: "center" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} style={{ border: 0, background: "none", color: "#c39aff", cursor: "pointer" }}>
            {mode === "login" ? "Create account" : "Log in"}
          </button>
        </p>
      </form>
    </main>
  );
}
