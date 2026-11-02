"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const STATUSES = ["In Progress", "Delivered", "Cancelled"];

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([]);
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_address: "",
    device_type: "mobile", brand: "", model: "", imei_serial: "",
    problem: "", repair_cost: 0, received_date: new Date().toISOString().slice(0,10),
    start_date: new Date().toISOString().slice(0,10), status: "In Progress",
    repair_type: "No Spare Part", spare_part_id: "", spare_part_quantity: 1, spare_parts_cost: 0,
  });

  async function load() { 
    setRepairs(await api("/repairs")); 
  }
  
  async function loadParts() { 
    setParts(await api("/spare-parts")); 
  }
  
  useEffect(() => { 
    load(); 
    loadParts(); 
  }, []);

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.spare_part_id) {
      delete payload.spare_part_id;
      delete payload.spare_part_quantity;
      delete payload.spare_parts_cost;
    }
    await api("/repairs", { method: "POST", body: JSON.stringify(payload) });
    setShowForm(false);
    setForm({ ...form, customer_name: "", customer_phone: "", problem: "" });
    load(); 
    loadParts();
  }

  async function updateStatus(id, status) {
    await api(`/repairs/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="container">
      <div className="section-heading">
        <h2>Repairs</h2>
        <div className="line"></div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Repair"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="field">Customer Name * <input required value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} /></label>
          <label className="field">Phone <input value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} /></label>
          <label className="field full">Address <input value={form.customer_address} onChange={(e) => setForm({...form, customer_address: e.target.value})} /></label>
          <label className="field">Device Type <input value={form.device_type} onChange={(e) => setForm({...form, device_type: e.target.value})} /></label>
          <label className="field">Brand <input value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} /></label>
          <label className="field">Model <input value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} /></label>
          <label className="field">IMEI/Serial <input value={form.imei_serial} onChange={(e) => setForm({...form, imei_serial: e.target.value})} /></label>
          <label className="field">Problem <input value={form.problem} onChange={(e) => setForm({...form, problem: e.target.value})} /></label>
          <label className="field">Repair Cost ($) <input type="number" value={form.repair_cost} onChange={(e) => setForm({...form, repair_cost: Number(e.target.value)})} /></label>
          
          <label className="field full">Repair Type 
            <select value={form.repair_type} onChange={(e) => setForm({...form, repair_type: e.target.value})}>
              <option>No Spare Part</option>
              <option>Spare Part</option>
            </select>
          </label>

          {form.repair_type === "Spare Part" && (
            <>
              <label className="field">Spare Part
                <select value={form.spare_part_id} onChange={(e) => setForm({...form, spare_part_id: e.target.value})}>
                  <option value="">-- select --</option>
                  {parts.map((p) => <option key={p.part_id} value={p.part_id}>{p.part_name} (Stock: {p.current_stock})</option>)}
                </select>
              </label>
              <label className="field">Quantity <input type="number" value={form.spare_part_quantity} onChange={(e) => setForm({...form, spare_part_quantity: Number(e.target.value)})} /></label>
            </>
          )}
          
          <div className="full" style={{ marginTop: 10 }}>
            <button type="submit" className="btn">Save Repair</button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Customer</th><th>Device</th><th>Cost</th><th>Paid</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {repairs.map((r) => (
              <tr key={r.repair_id}>
                <td>#{r.repair_id}</td>
                <td style={{ fontWeight: 600 }}>{r.customer_name}<br/><small style={{ color: "var(--muted)", fontWeight: 400 }}>{r.customer_phone}</small></td>
                <td>{r.brand} {r.model}</td>
                <td>${Number(r.repair_cost).toFixed(2)}</td>
                <td>${Number(r.paid || 0).toFixed(2)}</td>
                <td>
                  <select value={r.status} onChange={(e) => updateStatus(r.repair_id, e.target.value)} style={{ padding: "6px", minHeight: "auto", fontSize: 13, width: "auto" }}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {/* BADHANKA INVOICE-KA (Wuxuu ku furayaa tab cusub) */}
                  <button 
                    className="btn secondary" 
                  onClick={() => window.location.href = `/dashboard/invoice?id=${r.repair_id}`}
                    style={{ padding: "6px 12px", minHeight: 36, fontSize: 14, marginRight: 5 }}
                  >
                    Invoice
                  </button>
                  
                  {/* BADHANKA DELETE */}
                  <button className="btn danger" onClick={async () => {
                    if(confirm("Ma hubtaa inaad tirtirto repair-kan?")) { 
                      await api(`/repairs/${r.repair_id}`, { method: "DELETE" }); 
                      load(); 
                    }
                  }} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}