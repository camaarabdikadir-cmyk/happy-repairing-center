"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState({ username: "admin", role: "admin" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("username") || "admin";
    const role = localStorage.getItem("role") || "admin";
    setUser({ username: name, role });

    api("/dashboard")
      .then((res) => {
        // Hubi haddii xogta ay timid
        console.log("Xogta Dashboard-ka:", res); 
        setData(res);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="container" style={{ color: "red" }}>Khalad: {error}</div>;
  if (!data) return <div className="container">Loading...</div>;

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container">
      {/* WELCOME SECTION */}
      <div className="welcome">
        <div>
          <div className="date">{currentDate}</div>
          <h1>Welcome, {user.username}.</h1>
          <p>Where every job is, and the money.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn secondary" onClick={() => router.push("/dashboard/payments")}>See Payments</button>
          <button className="btn" onClick={() => router.push("/dashboard/repairs")}>+ New Repair</button>
        </div>
      </div>

      {/* REPAIRS SECTION - Waxaan hubinayaa in data.repairs uu jiro */}
      {user.role !== "sales" && data.repairs && (
        <div>
          <div className="section-heading">
            <h2>Repairs</h2>
            <div className="line"></div>
            <div className="section-meta">{data.repairs.total || 0} Total</div>
          </div>

          <div className="jobs-grid">
            <div className="job-status">
              <h3>In Progress</h3>
              <div className="number">{data.repairs.in_progress || 0}</div>
              <div className="status-progress">
                <span className="current"></span><span></span><span></span><span></span><span></span>
              </div>
              <p>Currently being fixed</p>
            </div>
            <div className="job-status">
              <h3>Delivered</h3>
              <div className="number">{data.repairs.delivered || 0}</div>
              <div className="status-progress">
                <span className="completed"></span><span className="completed"></span><span className="current"></span><span></span><span></span>
              </div>
              <p>Handed to customer</p>
            </div>
            <div className="job-status">
              <h3>Pending Parts</h3>
              <div className="number">0</div>
              <div className="status-progress"><span></span><span></span><span></span><span></span><span></span></div>
              <p>Waiting for stock</p>
            </div>
            <div className="job-status">
              <h3>Returned</h3>
              <div className="number">0</div>
              <div className="status-progress"><span></span><span></span><span></span><span></span><span></span></div>
              <p>Customer returned device</p>
            </div>
            <div className="job-status">
              <h3>Cancelled</h3>
              <div className="number">0</div>
              <div className="status-progress"><span></span><span></span><span></span><span></span><span></span></div>
              <p>Job cancelled</p>
            </div>
          </div>
        </div>
      )}

      {/* MONEY SECTION */}
      {data.money && (
        <>
          <div className="section-heading">
            <h2>Money</h2>
            <div className="line"></div>
            <div className="section-meta">Dollars counted apart</div>
          </div>

          <div className="money-grid">
            <div className="money-card">
              <h3>Billed</h3>
              <div className="amount">${Number(data.money.billed || 0).toFixed(2)}</div>
              <div className="description">Total amount invoiced</div>
            </div>
            <div className="money-card">
              <h3>Paid</h3>
              <div className="amount">${Number(data.money.paid || 0).toFixed(2)}</div>
              <div className="description">Total amount collected</div>
            </div>
            <div className="money-card">
              <h3>Outstanding</h3>
              <div className="amount" style={{ color: "#dc2626" }}>${Number(data.money.outstanding || 0).toFixed(2)}</div>
              <div className="description">Awaiting payment</div>
            </div>
          </div>
        </>
      )}

      {/* RECENT REPAIRS */}
      {user.role !== "sales" && data.recent && (
        <div>
          <div className="section-heading" style={{ marginTop: 55 }}>
            <h2>Recent Repairs</h2>
            <div className="line"></div>
          </div>
          <div style={{ overflowX: "auto", marginBottom: 50 }}>
            <table>
              <thead>
                <tr><th>Customer</th><th>Device</th><th>Cost</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.recent.map((r) => (
                  <tr key={r.repair_id}>
                    <td style={{ fontWeight: 600 }}>{r.customer_name}</td>
                    <td>{r.brand} {r.model}</td>
                    <td>${Number(r.repair_cost || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 500 }}>{r.status}</td>
                  </tr>
                ))}
                {data.recent.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: "center" }}>Ma jiraan repairs weli.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}