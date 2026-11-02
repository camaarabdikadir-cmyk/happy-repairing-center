"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function DashLayout({ children }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ username: "admin", role: "admin" });
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("username") || "admin";
    const role = localStorage.getItem("role") || "admin";
    setUser({ username: name, role });
  }, []);
  // Qari menu-ga marka link la taabto (Mobile)
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);
  if (!mounted) return null;
  function logout() {
    localStorage.clear();
    router.push("/login");
  }
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="topbar">
        <div className="brand">
          happy.repairing
          <span className="subtitle">Berbera, Somaliland</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ color: "var(--muted)", fontSize: 15, display: "none" }} className="desktop-only">{user.username}</span>
          <button className="btn danger" onClick={logout} style={{ padding: "8px 15px", minHeight: 40, fontSize: 15 }}>Logout</button>
          {/* Badhanka Menu-ga Mobilka */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "transparent", border: "none", fontSize: 28, color: "var(--text)" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <div className={`nav ${menuOpen ? "active" : ""}`}>
        <Link href="/dashboard" className={path === "/dashboard" ? "active" : ""}>Dashboard</Link>
        {user.role !== "sales" && (
          <>
            <Link href="/dashboard/repairs" className={path === "/dashboard/repairs" ? "active" : ""}>Repairs</Link>
            <Link href="/dashboard/spare-parts" className={path === "/dashboard/spare-parts" ? "active" : ""}>Spare Parts</Link>
          </>
        )}
        {user.role !== "repair" && (
          <Link href="/dashboard/sales" className={path === "/dashboard/sales" ? "active" : ""}>Sales</Link>
        )}
        {user.role !== "sales" && (
          <Link href="/dashboard/payments" className={path === "/dashboard/payments" ? "active" : ""}>Payments</Link>
        )}
        {user.role === "admin" && (
          <>
            <Link href="/dashboard/users" className={path === "/dashboard/users" ? "active" : ""}>Users</Link>
            <Link href="/dashboard/settings" className={path === "/dashboard/settings" ? "active" : ""}>Settings</Link>
          </>
        )}
      </div>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
