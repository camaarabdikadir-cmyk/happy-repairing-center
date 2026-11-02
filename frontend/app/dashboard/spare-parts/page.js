"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export default function SparePartsPage() {
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ part_name: "", brand: "", buy_price: 0, sell_price: 0, current_stock: 0, minimum_stock: 5 });
  async function load() { setParts(await api("/spare-parts")); }
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    await api("/spare-parts", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ ...form, part_name: "", brand: "" });
    load();
  }
  async function stockIn(part) {
    const qty = prompt(`Stock in quantity for "${part.part_name}"?`, "10");
    if (!qty) return;
    await api(`/spare-parts/${part.part_id}/stock-in`, { method: "POST", body: JSON.stringify({ quantity: Number(qty), buy_price: part.buy_price }) });
    load();
  }
  return (
    <div className="container">
      <div className="section-heading">
        <h2>Spare Parts</h2>
        <div className="line"></div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New Part"}</button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="field full">Part Name * <input required value={form.part_name} onChange={(e) => setForm({...form, part_name: e.target.value})} /></label>
          <label className="field">Brand <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} /></label>
          <label className="field">Current Stock <input type="number" value={form.current_stock} onChange={(e) => setForm({...form, current_stock: Number(e.target.value)})} /></label>
          <label className="field">Buy Price ($) <input type="number" value={form.buy_price} onChange={(e) => setForm({...form, buy_price: Number(e.target.value)})} /></label>
          <label className="field">Sell Price ($) <input type="number" value={form.sell_price} onChange={(e) => setForm({...form, sell_price: Number(e.target.value)})} /></label>
          <label className="field">Min Stock <input type="number" value={form.minimum_stock} onChange={(e) => setForm({...form, minimum_stock: Number(e.target.value)})} /></label>
          <div className="full" style={{ marginTop: 10 }}><button type="submit" className="btn">Save Part</button></div>
        </form>
      )}
      <div style={{ overflowX: "auto", marginBottom: 50 }}>
        <table>
          <thead><tr><th>Part Name</th><th>Brand</th><th>Buy Price</th><th>Sell Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.part_id}>
                <td style={{ fontWeight: 600 }}>{p.part_name}</td>
                <td>{p.brand}</td>
                <td>${p.buy_price}</td>
                <td>${p.sell_price}</td>
                <td style={{ color: p.current_stock <= p.minimum_stock ? "#dc2626" : "var(--text)", fontWeight: 600 }}>{p.current_stock}</td>
                <td><button className="btn" onClick={() => stockIn(p)} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>+ Stock</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
