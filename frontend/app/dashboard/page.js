"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState({ username: "admin", role: "admin" });
  const [filter, setFilter] = useState("all"); 
  const router = useRouter();
  useEffect(() => {
    const name = localStorage.getItem("username") || "admin";
    const role = localStorage.getItem("role") || "admin";
    setUser({ username: name, role });
    loadData();
  }, [filter]);
  async function loadData() {
    try {
      const res = await api(`/dashboard?filter=${filter}`);
      setData(res);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  }
  if (!data) return <div className="container">Loading Dashboard...</div>;
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="container">
      {/* HEADER & FILTERS */}
      <div className="welcome" style={{ marginBottom: 40 }}>
        <div>
          <div className="date">{currentDate}</div>
          <h1>Welcome, {user.username}.</h1>
          <p>Here is your business performance overview.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className={`btn ${filter === "all" ? "" : "secondary"}`} onClick={() => setFilter("all")}>All Time</button>
          <button className={`btn ${filter === "daily" ? "" : "secondary"}`} onClick={() => setFilter("daily")}>Today</button>
          <button className={`btn ${filter === "weekly" ? "" : "secondary"}`} onClick={() => setFilter("weekly")}>This Week</button>
          <button className={`btn ${filter === "monthly" ? "" : "secondary"}`} onClick={() => setFilter("monthly")}>This Month</button>
          <button className={`btn ${filter === "yearly" ? "" : "secondary"}`} onClick={() => setFilter("yearly")}>This Year</button>
        </div>
      </div>
      {/* REPAIRS SECTION */}
      {user.role !== "sales" && data.repairs && (
        <div style={{ marginBottom: 50 }}>
          <div className="section-heading">
            <h2>Repairs</h2>
            <div className="line"></div>
            <div className="section-meta">{data.repairs.total} Total</div>
          </div>
          <div className="jobs-grid">
            <div className="job-status">
              <h3>Total Repairs</h3>
              <div className="number">{data.repairs.total}</div>
              <p>Received in this period</p>
            </div>
            <div className="job-status">
              <h3>In Progress</h3>
              <div className="number">{data.repairs.in_progress}</div>
              <p>Currently being fixed</p>
            </div>
            <div className="job-status">
              <h3>Delivered</h3>
              <div className="number">{data.repairs.delivered}</div>
              <p>Handed to customer</p>
            </div>
          </div>
        </div>
      )}
      {/* SALES SECTION */}
      {user.role !== "repair" && data.sales && (
        <div style={{ marginBottom: 50 }}>
          <div className="section-heading">
            <h2>Sales Revenue</h2>
            <div className="line"></div>
          </div>
          <div className="money-grid">
            <div className="money-card">
              <h3>Sales Revenue</h3>
              <div className="amount">${Number(data.sales.revenue).toFixed(2)}</div>
              <div className="description">Total generated from product sales</div>
            </div>
            <div className="money-card">
              <h3>Sales Profit</h3>
              <div className="amount" style={{ color: "#16a34a" }}>+${Number(data.sales.profit).toFixed(2)}</div>
              <div className="description">Earned profit from product sales</div>
            </div>
            <div className="money-card">
              <h3>Products Sold</h3>
              <div className="amount">{data.sales.qty_sold} <span style={{ fontSize: 16, color: "var(--muted)" }}>units</span></div>
              <div className="description">Total products sold</div>
            </div>
          </div>
        </div>
      )}
      {/* MONEY SECTION (REPAIRS) */}
      {data.money && (
        <>
          <div className="section-heading">
            <h2>Repairs Money</h2>
            <div className="line"></div>
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
        <div style={{ marginTop: 50 }}>
          <div className="section-heading">
            <h2>Recent Repairs</h2>
            <div className="line"></div>
            <button className="btn secondary" onClick={() => router.push("/dashboard/repairs")}>View All</button>
          </div>
          <div className="table-wrap">
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
                  <tr><td colSpan="4" style={{ textAlign: "center" }}>No repairs found for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
