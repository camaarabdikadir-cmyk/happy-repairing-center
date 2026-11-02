"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_name: "", category: "", buy_price: 0, sell_price: 0, current_stock: 0 });
  async function load() { setProducts(await api("/products")); }
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    await api("/products", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ ...form, product_name: "", category: "" });
    load();
  }
  async function sell(product) {
    const qty = prompt(`Tirada la iibinayo "${product.product_name}"?`, "1");
    if (!qty) return;
    await api(`/products/${product.product_id}/sell`, { 
      method: "POST", 
      body: JSON.stringify({ quantity: Number(qty), sell_price: product.sell_price }) 
    });
    load();
  }
  async function deleteProduct(id) {
    if (!confirm("Ma hubtaa inaad tirtirto alaabtan?")) return;
    await api(`/products/${id}`, { method: "DELETE" });
    load();
  }
  return (
    <div className="container">
      <div className="section-heading">
        <h2>Sales & Products</h2>
        <div className="line"></div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Product"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="field full">Magaca Alaabta * <input required value={form.product_name} onChange={(e) => setForm({...form, product_name: e.target.value})} /></label>
          <label className="field">Nooca (Category) <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} /></label>
          <label className="field">Stock-ka Hore <input type="number" value={form.current_stock} onChange={(e) => setForm({...form, current_stock: Number(e.target.value)})} /></label>
          <label className="field">Qiimaha Iibsiga ($) <input type="number" value={form.buy_price} onChange={(e) => setForm({...form, buy_price: Number(e.target.value)})} /></label>
          <label className="field">Qiimaha Iibka ($) <input type="number" value={form.sell_price} onChange={(e) => setForm({...form, sell_price: Number(e.target.value)})} /></label>
          <div className="full" style={{ marginTop: 10 }}><button type="submit" className="btn">Save Product</button></div>
        </form>
      )}
      <div style={{ overflowX: "auto", marginBottom: 50 }}>
        <table>
          <thead><tr><th>Alaabta</th><th>Nooca</th><th>Iibsiga</th><th>Iibka</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                <td>{p.category || "-"}</td>
                <td>${Number(p.buy_price).toFixed(2)}</td>
                <td>${Number(p.sell_price).toFixed(2)}</td>
                <td style={{ color: p.current_stock > 0 ? "var(--text)" : "#dc2626", fontWeight: 600 }}>{p.current_stock}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="btn" disabled={p.current_stock === 0} onClick={() => sell(p)} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14, marginRight: 5, opacity: p.current_stock === 0 ? 0.5 : 1 }}>Sell</button>
                  <button className="btn danger" onClick={() => deleteProduct(p.product_id)} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
