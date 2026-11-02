"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  
  // Xogta dukaanka oo laga keenay Settings-ka
  const [storeInfo, setStoreInfo] = useState({
    store_name: "happy.repairing",
    subtitle: "Berbera, Somaliland",
    phone: "0634245417",
    email: "zuldan@gmail.com"
  });

  useEffect(() => {
    // Soo qaado xogta dukaanka
    const savedInfo = localStorage.getItem("store_settings");
    if (savedInfo) {
      setStoreInfo(JSON.parse(savedInfo));
    }

    // Soo qaado xogta repair-ka
    if (id) {
      api(`/repairs/${id}`)
        .then((data) => {
          setRepair(data);
        })
        .catch((err) => setError(err.message));
    } else {
      setError("Repair ID-ga lama helin.");
    }
  }, [id]);

  if (error) return <div className="container" style={{ color: "red" }}>Khalad: {error}</div>;
  if (!repair) return <div className="container">Loading Invoice...</div>;

  const cost = Number(repair.repair_cost) || 0;
  const paid = Number(repair.paid) || 0;
  const balance = cost - paid;

  return (
    <>
      {/* CSS-ka Daabacaadda (Print) ee A6 */}
      <style>{`
        @media print {
          .topbar, .nav, .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
            margin: 0;
            padding: 0;
          }
          .container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          @page {
            size: A6;
            margin: 5mm;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* Badhamada */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button className="btn" onClick={() => window.print()}>🖨️ Print Invoice</button>
          <button className="btn secondary" onClick={() => router.push("/dashboard/repairs")}>⬅️ Back to Repairs</button>
        </div>

        <div className="card" style={{ padding: 40, background: "#fff", color: "#000", borderRadius: 8 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #a80000", paddingBottom: 20, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, color: "#a80000", margin: 0 }}>
                {storeInfo.store_name}
              </h1>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: 1, fontWeight: "bold" }}>{storeInfo.subtitle}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: 24, margin: 0, color: "#a80000" }}>INVOICE</h2>
              <p style={{ margin: 0, fontWeight: "bold" }}>#JOB-{String(repair.repair_id).padStart(5, '0')}</p>
              <p style={{ margin: 0 }}>{new Date(repair.received_date || repair.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
            <div>
              <h4 style={{ background: "#a80000", color: "#fff", padding: "4px 8px", margin: "0 0 10px 0", fontSize: 12, display: "inline-block" }}>BILL TO</h4>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>{repair.customer_name}</p>
              <p style={{ margin: "4px 0" }}>{repair.customer_phone || "Telefoon ma jiro"}</p>
              <p style={{ margin: "4px 0" }}>{repair.customer_address || "Cinwaan ma jiro"}</p>
            </div>
            <div>
              <h4 style={{ background: "#a80000", color: "#fff", padding: "4px 8px", margin: "0 0 10px 0", fontSize: 12, display: "inline-block" }}>DEVICE INFO</h4>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>{repair.brand} {repair.model}</p>
              <p style={{ margin: "4px 0" }}>IMEI: {repair.imei_serial || "N/A"}</p>
              <p style={{ margin: "4px 0" }}>Cilad: {repair.problem || "N/A"}</p>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, minWidth: "auto" }}>
            <thead>
              <tr style={{ background: "#a80000", color: "#fff" }}>
                <th style={{ padding: 10, textAlign: "left", border: "1px solid #000" }}>DESCRIPTION</th>
                <th style={{ padding: 10, width: 50, border: "1px solid #000" }}>QTY</th>
                <th style={{ padding: 10, width: 100, textAlign: "right", border: "1px solid #000" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 10, border: "1px solid #000" }}>Dayactirka Device-ka - {repair.problem || "Repair"}</td>
                <td style={{ padding: 10, textAlign: "center", border: "1px solid #000" }}>1</td>
                <td style={{ padding: 10, textAlign: "right", border: "1px solid #000" }}>${cost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <table style={{ width: 250, borderCollapse: "collapse", minWidth: "auto" }}>
              <tbody>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #000", fontWeight: "bold", background: "#eee" }}>Total</td>
                  <td style={{ padding: 8, border: "1px solid #000", textAlign: "right" }}>${cost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #000", fontWeight: "bold", background: "#eee" }}>La Bixiyay</td>
                  <td style={{ padding: 8, border: "1px solid #000", textAlign: "right" }}>${paid.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #000", fontWeight: "bold", background: "#a80000", color: "#fff" }}>Hadhay</td>
                  <td style={{ padding: 8, border: "1px solid #000", textAlign: "right", fontWeight: "bold" }}>${balance.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: "#555" }}>
            <p>Thank you for your business!</p>
            <p>{storeInfo.phone} | {storeInfo.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function InvoicePage() {
  return <Suspense fallback={<div className="container">Loading...</div>}><InvoiceContent /></Suspense>;
}