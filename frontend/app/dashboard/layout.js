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
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("username") || "admin";
    const role = localStorage.getItem("role") || "admin";
    setUser({ username: name, role });
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  function applyTheme(t) {
    if (t === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  }
  function changeTheme(t) {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  }
  if (!mounted) return null;
  function logout() {
    localStorage.clear();
    router.push("/login");
  }
  const ThemeSwitcher = () => (
    <div className="theme-switcher">
      <button onClick={() => changeTheme("light")} className={theme === "light" ? "active" : ""} title="Light">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      </button>
      <button onClick={() => changeTheme("dark")} className={theme === "dark" ? "active" : ""} title="Dark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
      <button onClick={() => changeTheme("system")} className={theme === "system" ? "active" : ""} title="System">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      </button>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>}
      <div className="topbar">
        <div className="brand">
          happy.repairing
          <span className="subtitle">Berbera, Somaliland</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ color: "var(--muted)", fontSize: 15 }} className="desktop-only">{user.username}</span>
          <div className="desktop-only">
            <ThemeSwitcher />
          </div>
          <button className="btn danger desktop-only" onClick={logout} style={{ padding: "8px 15px", minHeight: 40, fontSize: 15 }}>Logout</button>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", fontSize: 28, color: "var(--text)" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <div className={`nav ${menuOpen ? "active" : ""}`}>
        <div className="mobile-theme-wrapper" style={{ display: "none" }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Theme</span>
          <ThemeSwitcher />
        </div>
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
        <button className="btn danger mobile-logout-btn" onClick={logout} style={{ display: "none", margin: "20px 25px", width: "calc(100% - 50px)" }}>
          Logout
        </button>
      </div>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
