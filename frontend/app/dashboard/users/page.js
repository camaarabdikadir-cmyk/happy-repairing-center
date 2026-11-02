"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "repair" });
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    // Hubi haddii qofkan uu yahay Admin
    if (localStorage.getItem("role") !== "admin") {
      alert("Ma haysatid fasax aad ku gasho boggan.");
      router.push("/dashboard");
      return;
    }
    load();
  }, [router]);
  async function load() {
    try {
      setUsers(await api("/auth/users"));
    } catch (e) {
      setError(e.message);
    }
  }
  async function submit(e) {
    e.preventDefault();
    await api("/auth/users", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ ...form, username: "", password: "" });
    load();
  }
  async function deleteUser(id) {
    if (!confirm("Ma hubtaa inaad tirtirto shaqaalahan?")) return;
    await api(`/auth/users/${id}`, { method: "DELETE" });
    load();
  }
  return (
    <div className="container">
      <div className="section-heading">
        <h2>Staff Management (Users)</h2>
        <div className="line"></div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New User"}</button>
      </div>
      {error && <p style={{ color: "red", marginBottom: 20 }}>{error}</p>}
      {showForm && (
        <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="field full">Username * <input required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} /></label>
          <label className="field full">Password * <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} /></label>
          <label className="field full">Role (Qaybta uu ka shaqeeyo)
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              <option value="repair">Repair (Dayactirka kaliya)</option>
              <option value="sales">Sales (Iibka kaliya)</option>
              <option value="admin">Admin (Wax walba)</option>
            </select>
          </label>
          <div className="full" style={{ marginTop: 10 }}><button type="submit" className="btn">Keydi User-ka</button></div>
        </form>
      )}
      <div style={{ overflowX: "auto", marginBottom: 50 }}>
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Created At</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td>#{u.user_id}</td>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td><span className="badge" style={{ background: "var(--hover-bg)", color: "var(--text)", textTransform: "capitalize" }}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.username !== "admin" && (
                    <button className="btn danger" onClick={() => deleteUser(u.user_id)} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
