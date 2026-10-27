"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../../lib/api";
import { useCurrentUser } from "../../lib/useCurrentUser";

export default function Sidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();

  const links = [
    { name: "📊 Dashboard", href: "/dashboard" },
    { name: "👨‍🎓 Students", href: "/students" },
    { name: "👨‍🏫 Teachers", href: "/teachers" },
    { name: "📚 Courses", href: "/courses" },
    { name: "📝 Exams", href: "/exams" },
    { name: "💰 Fees", href: "/fees" },
  ];

  return (
    <div
      style={{
        width: "250px",
        minWidth: "250px",
        maxWidth: "250px",
        flexShrink: 0,
        background: "#1e3a8a",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>🎓 Education ERP</h2>
        {currentUser && (
          <p
            style={{
              fontSize: "12px",
              color: "#93c5fd",
              marginBottom: "20px",
              background: "rgba(255,255,255,0.08)",
              padding: "6px 10px",
              borderRadius: "6px",
            }}
          >
            👤 Logged in as: <strong>{currentUser.username || "Admin"}</strong>
          </p>
        )}

        <div style={{ marginTop: "15px" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                <p
                  style={{
                    margin: "10px 0",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                    color: isActive ? "#facc15" : "white",
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                >
                  {link.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => logout()}
        style={{
          background: "transparent",
          border: "1px solid rgba(252, 165, 165, 0.4)",
          color: "#fca5a5",
          padding: "10px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          textAlign: "left",
          marginTop: "20px",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}