"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ product_name: "", category: "", buy_price: 0, sell_price: 0, current_stock: 0 });
  // Xogta Iibka (Sell Modal)
  const [sellModal, setSellModal] = useState(null); 
  const [sellQty, setSellQty] = useState(1);
  const [sellBy, setSellBy] = useState("admin");
  const [errorMsg, setErrorMsg] = useState("");
  async function loadData() { 
    try {
      const [prods, hist] = await Promise.all([ api("/products"), api("/products/history") ]);
      setProducts(prods);
      setHistory(hist);
    } catch (error) {
      console.error("Khalad soo qaadista xogta:", error);
    }
  }
  useEffect(() => { loadData(); }, []);
  function openEdit(product) {
    setEditId(product.product_id);
    setForm({
      product_name: product.product_name,
      category: product.category || "",
      buy_price: Number(product.buy_price),
      sell_price: Number(product.sell_price),
      current_stock: Number(product.current_stock)
    });
    setShowForm(true);
  }
  function resetForm() {
    setEditId(null);
    setForm({ product_name: "", category: "", buy_price: 0, sell_price: 0, current_stock: 0 });
    setShowForm(false);
  }
  async function submit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await api(`/products/${editId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/products", { method: "POST", body: JSON.stringify(form) });
      }
      resetForm();
      loadData();
    } catch (err) {
      alert("Khalad: " + err.message);
    }
  }
  async function stockIn(product) {
    const qty = prompt(`Immisa xabo ayaad soo iibsatay oo aad ku darayso "${product.product_name}"?`, "10");
    if (!qty) return;
    const newBuyPrice = prompt(`Qiimaha aad ku iibsatay xabo kasta?`, product.buy_price);
    if (!newBuyPrice) return;
    try {
      await api(`/products/${product.product_id}/stock-in`, { 
        method: "POST", 
        body: JSON.stringify({ quantity: Number(qty), buy_price: Number(newBuyPrice), note: `Stock In by admin` }) 
      });
      loadData();
      alert(`✅ ${qty} xabo ayaa lagu daray stock-ga ${product.product_name}!`);
    } catch (err) {
      alert("Khalad Stock In: " + err.message);
    }
  }
  // Function-ka Iibka oo cusub (Form ahaan)
  async function handleSellSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (sellQty > sellModal.current_stock) {
      setErrorMsg("Stock kuma filna! Kaliya waxaa hadhay " + sellModal.current_stock);
      return;
    }
    try {
      await api(`/products/${sellModal.product_id}/sell`, { 
        method: "POST", 
        body: JSON.stringify({ 
          quantity: Number(sellQty), 
          sell_price: Number(sellModal.sell_price), 
          note: `Sold by: ${sellBy}` 
        }) 
      });
      setSellModal(null); // Xir foomka
      loadData();
      alert("✅ Alaabta si guul leh aaa loo iibiyay!");
    } catch (err) {
      setErrorMsg("Khalad API: " + err.message);
    }
  }
  async function deleteProduct(id) {
    if (!confirm("Ma hubtaa inaad tirtirto alaabtan?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Khalad: " + err.message);
    }
  }
  let totalStock = 0, totalInvestment = 0, potentialRevenue = 0;
  products.forEach(p => {
    const stock = Number(p.current_stock) || 0;
    totalStock += stock;
    totalInvestment += (stock * Number(p.buy_price || 0));
    potentialRevenue += (stock * Number(p.sell_price || 0));
  });
  return (
    <div className="container">
      <div className="section-heading">
        <h2>Sales & Products</h2>
        <div className="line"></div>
        {activeTab === "products" && (
          <button className="btn" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? "Cancel" : "+ New Product"}
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button className={`btn ${activeTab === "products" ? "" : "secondary"}`} onClick={() => setActiveTab("products")}>Alaabta (Stock)</button>
        <button className={`btn ${activeTab === "history" ? "" : "secondary"}`} onClick={() => setActiveTab("history")}>Taariikhda Iibka</button>
      </div>
      {activeTab === "products" && (
        <>
          {showForm && (
            <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="full" style={{ margin: "0 0 10px 0", fontFamily: "var(--font-heading)" }}>
                {editId ? "Wax ka beddel Alaabta" : "Ku dar Alaab Cusub"}
              </h3>
              <label className="field full">Magaca Alaabta * <input required value={form.product_name} onChange={(e) => setForm({...form, product_name: e.target.value})} /></label>
              <label className="field">Nooca (Category) <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} /></label>
              <label className="field">Stock-ka Hadda <input type="number" value={form.current_stock} onChange={(e) => setForm({...form, current_stock: Number(e.target.value)})} /></label>
              <label className="field">Qiimaha Iibsiga ($) <input type="number" value={form.buy_price} onChange={(e) => setForm({...form, buy_price: Number(e.target.value)})} /></label>
              <label className="field">Qiimaha Iibka ($) <input type="number" value={form.sell_price} onChange={(e) => setForm({...form, sell_price: Number(e.target.value)})} /></label>
              <div className="full" style={{ marginTop: 10 }}>
                <button type="submit" className="btn">{editId ? "Update Product" : "Save Product"}</button>
              </div>
            </form>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>Total Stock Units</div>
              <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>{totalStock} <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 400 }}>units</span></h2>
            </div>
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>Total Investment</div>
              <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>${totalInvestment.toFixed(2)}</h2>
            </div>
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>Potential Revenue</div>
              <h2 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>${potentialRevenue.toFixed(2)}</h2>
            </div>
          </div>
          <div className="table-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", padding: "12px 15px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>All Products</h3>
              <span className="badge" style={{ background: "var(--strong-border)", color: "var(--bg)", padding: "4px 10px" }}>Total: {products.length}</span>
            </div>
            <table style={{ marginTop: 0 }}>
              <thead>
                <tr><th>ID</th><th>Product Name</th><th>Category</th><th>Buy Price</th><th>Sell Price</th><th>Stock</th><th>Profit</th><th>Total Value</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = Number(p.current_stock) || 0;
                  const buy = Number(p.buy_price) || 0;
                  const sell = Number(p.sell_price) || 0;
                  const profit = sell - buy;
                  const totalValue = stock * sell;
                  const isLowStock = stock < 5;
                  return (
                    <tr key={p.product_id}>
                      <td style={{ fontWeight: 600 }}>#{p.product_id}</td>
                      <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                      <td>{p.category || "-"}</td>
                      <td>${buy.toFixed(2)}</td>
                      <td>${sell.toFixed(2)}</td>
                      <td>
                        <span className="badge" style={{ background: isLowStock ? "#fee2e2" : "#dcfce7", color: isLowStock ? "#dc2626" : "#166534" }}>{stock} units</span>
                      </td>
                      <td style={{ color: "#16a34a", fontWeight: 600 }}>+${profit.toFixed(2)}</td>
                      <td style={{ fontWeight: 700 }}>${totalValue.toFixed(2)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn secondary" onClick={() => { setSellModal(p); setSellQty(1); setSellBy("admin"); setErrorMsg(""); }} style={{ padding: "6px 10px", minHeight: 32, fontSize: 13, marginRight: 5 }} disabled={stock === 0}>Sell</button>
                        <button className="btn secondary" onClick={() => stockIn(p)} style={{ padding: "6px 10px", minHeight: 32, fontSize: 13, marginRight: 5, color: "#2563eb", borderColor: "#2563eb" }}>+ Stock</button>
                        <button className="btn secondary" onClick={() => openEdit(p)} style={{ padding: "6px 10px", minHeight: 32, fontSize: 13, marginRight: 5, color: "#d97706", borderColor: "#d97706" }}>Edit</button>
                        <button className="btn danger" onClick={() => deleteProduct(p.product_id)} style={{ padding: "6px 10px", minHeight: 32, fontSize: 13 }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {activeTab === "history" && (
        <div className="table-wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", padding: "12px 15px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Sales History (Taariikhda Iibka)</h3>
          </div>
          <table style={{ marginTop: 0 }}>
            <thead>
              <tr><th>Date</th><th>Product Name</th><th>Qty Sold</th><th>Price</th><th>Total</th><th>Sold By</th></tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.stock_out_id}>
                  <td>{new Date(h.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{h.product_name} <br/><small style={{color: "var(--muted)", fontWeight: 400}}>{h.category}</small></td>
                  <td style={{ fontWeight: 600 }}>{h.quantity} units</td>
                  <td>${Number(h.sell_price).toFixed(2)}</td>
                  <td style={{ fontWeight: 700 }}>${(Number(h.quantity) * Number(h.sell_price)).toFixed(2)}</td>
                  <td style={{ color: "var(--text)" }}>{h.note || "Unknown"}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: 30 }}>Ma jiraan iibyo weli dhacay.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* MODAL-KA IIBKA (Sell Modal) */}
      {sellModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 25, background: "#fff", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 15, fontFamily: "var(--font-heading)" }}>Iibi Alaabta</h3>
            <p style={{ marginBottom: 15, fontWeight: 600 }}>{sellModal.product_name} <br/><span style={{ color: "var(--muted)", fontSize: 13 }}>Stock: {sellModal.current_stock} | Price: ${sellModal.sell_price}</span></p>
            {errorMsg && <p style={{ color: "red", fontSize: 14, marginBottom: 10, fontWeight: 600 }}>{errorMsg}</p>}
            <form onSubmit={handleSellSubmit}>
              <label className="field" style={{ marginBottom: 10 }}>Tirada la iibinayo
                <input type="number" required min="1" max={sellModal.current_stock} value={sellQty} onChange={(e) => setSellQty(e.target.value)} />
              </label>
              <label className="field" style={{ marginBottom: 20 }}>Yaa iibiyay?
                <input type="text" required value={sellBy} onChange={(e) => setSellBy(e.target.value)} />
              </label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn secondary" onClick={() => setSellModal(null)}>Cancel</button>
                <button type="submit" className="btn">Xaqiiji Iibka</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
