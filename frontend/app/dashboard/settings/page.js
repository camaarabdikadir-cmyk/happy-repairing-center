"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export default function SettingsPage() {
  const [form, setForm] = useState({
    store_name: "happy.repairing",
    subtitle: "Berbera, Somaliland",
    phone: "0634245417",
    email: "zuldan@gmail.com",
  });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const savedData = localStorage.getItem("store_settings");
    if (savedData) setForm(JSON.parse(savedData));
  }, []);
  function submit(e) {
    e.preventDefault();
    localStorage.setItem("store_settings", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }
  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div className="section-heading">
        <h2>Store Settings</h2>
        <div className="line"></div>
      </div>
      <form onSubmit={submit} className="form-grid card" style={{ padding: 30, background: "var(--surface)", border: "1px solid var(--border)" }}>
        <label className="field full">Store Name * 
          <input required value={form.store_name} onChange={(e) => setForm({...form, store_name: e.target.value})} />
        </label>
        <label className="field full">Subtitle / Location 
          <input value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} />
        </label>
        <label className="field">Phone Number * 
          <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
        </label>
        <label className="field">Email Address * 
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
        </label>
        <div className="full" style={{ marginTop: 10 }}>
          <button type="submit" className="btn">Save Settings</button>
          {saved && <span style={{ color: "#16a34a", marginLeft: 15, fontWeight: 600 }}>✅ Si guul leh ayaa loo kaydiyay!</span>}
        </div>
      </form>
    </div>
  );
}
