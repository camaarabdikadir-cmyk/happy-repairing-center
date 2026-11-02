"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      // Kaydi Token-ka iyo xogta qofka
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--surface)", padding: 40, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", textAlign: "center", fontSize: 32, marginBottom: 8 }}>happy.repairing</h2>
        <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 30, fontSize: 15 }}>Fadlan gal system-ka</p>
        
        <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          <label className="field">Username 
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Geli username-kaaga" />
          </label>
          <label className="field">Password 
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Geli password-kaaga" />
          </label>
          
          {err && <p style={{ color: "red", fontSize: 14, margin: 0 }}>{err}</p>}
          
          <button type="submit" className="btn" style={{ width: "100%", marginTop: 10 }}>Gal System-ka</button>
        </form>
      </div>
    </div>
  );
}