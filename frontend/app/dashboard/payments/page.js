"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ repair_id: "", amount_paid: 0, payment_method: "Cash", note: "" });

  async function load() {
    try {
      const [pays, reps] = await Promise.all([api("/payments"), api("/repairs")]);
      setPayments(pays);
      setRepairs(reps);
    } catch (e) {
      console.error(e);
    }
  }
  
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api("/payments", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ ...form, amount_paid: 0, note: "" });
    load();
  }

  return (
    <div className="container">
      <div className="section-heading">
        <h2>Payments</h2>
        <div className="line"></div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New Payment"}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="form-grid card" style={{ marginBottom: 40, padding: 25, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="field full">Dooro Repair-ka (Macmiilka)
            <select required value={form.repair_id} onChange={(e) => setForm({...form, repair_id: e.target.value})}>
              <option value="">-- Soo xarayso macmiil --</option>
              {repairs.map((r) => {
                // Hubi haddii xogta r.balance ay jirto ama aan xisaabinayno
                const balance = r.balance !== undefined ? r.balance : (r.repair_cost - (r.paid || 0));
                return (
                  <option key={r.repair_id} value={r.repair_id}>
                    #{r.repair_id} - {r.customer_name} | Hadhay: ${Number(balance).toFixed(2)}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="field">Lacagta La Bixiyay ($) <input type="number" step="0.01" required value={form.amount_paid} onChange={(e) => setForm({...form, amount_paid: Number(e.target.value)})} /></label>
          <label className="field">Habka Lacagta
            <select value={form.payment_method} onChange={(e) => setForm({...form, payment_method: e.target.value})}>
              <option>Cash</option><option>Zaad</option><option>E-Dahab</option><option>Sahal</option>
            </select>
          </label>
          <label className="field full">Faahfaahin <input value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} /></label>
          <div className="full" style={{ marginTop: 10 }}><button type="submit" className="btn">Keydi Lacagta</button></div>
        </form>
      )}

      <div style={{ overflowX: "auto", marginBottom: 50 }}>
        <table>
          <thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Note</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id}>
                <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>{p.customer_name}</td>
                <td style={{ color: "#16a34a", fontWeight: 600 }}>${Number(p.amount_paid).toFixed(2)}</td>
                <td><span className="badge" style={{ background: "var(--hover-bg)", color: "var(--text)" }}>{p.payment_method}</span></td>
                <td style={{ color: "var(--muted)" }}>{p.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}