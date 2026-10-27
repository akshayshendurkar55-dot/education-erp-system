"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardIcon,
  StudentsIcon,
  TeachersIcon,
  CoursesIcon,
  ExamsIcon,
  FeesIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  UserIcon,
  ShieldCheckIcon,
} from "./Icons";
import { logout, hasValidSession } from "../../lib/api";
import { useCurrentUser } from "../../lib/useCurrentUser";
import { useUI } from "../../lib/UIContext";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  actions,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirmAction, isMobileSidebarOpen, setIsMobileSidebarOpen } = useUI();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!hasValidSession()) {
      router.push("/login");
    }
  }, [router]);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
    { name: "Students", href: "/students", icon: StudentsIcon },
    { name: "Teachers", href: "/teachers", icon: TeachersIcon },
    { name: "Courses", href: "/courses", icon: CoursesIcon },
    { name: "Examinations", href: "/exams", icon: ExamsIcon },
    { name: "Fees Management", href: "/fees", icon: FeesIcon },
  ];

  const handleLogoutClick = () => {
    confirmAction({
      title: "Confirm Sign Out",
      message: "Are you sure you want to end your current administrative session?",
      confirmLabel: "Sign Out",
      cancelLabel: "Stay Logged In",
      isDestructive: false,
      onConfirm: () => {
        logout();
      },
    });
  };

  const sidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: "24px 20px 20px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "18px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🎓
            </div>
            <div>
              <h1
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Education ERP
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  color: "#93c5fd",
                  margin: "2px 0 0 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                College Information System
              </p>
            </div>
          </div>

          {/* Current User Card in Sidebar */}
          {currentUser && (
            <div
              style={{
                marginTop: "16px",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "10px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#bfdbfe",
                }}
              >
                <UserIcon size={16} />
              </div>
              <div style={{ overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {currentUser.username || "Administrator"}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    color: "#86efac",
                  }}
                >
                  <ShieldCheckIcon size={12} /> {currentUser.role || "ADMIN"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: "16px 12px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#93c5fd",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0 12px 8px 12px",
              margin: 0,
            }}
          >
            Main Menu
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    color: isActive ? "#ffffff" : "#cbd5e1",
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.14)"
                      : "transparent",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 500,
                    transition: "all 0.15s ease",
                    borderLeft: isActive
                      ? "3px solid #38bdf8"
                      : "3px solid transparent",
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? "#38bdf8" : "#94a3b8",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer / Logout */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          type="button"
          onClick={handleLogoutClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#fca5a5",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <LogoutIcon size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: "260px",
          minWidth: "260px",
          backgroundColor: "#1e3a8a",
          color: "#ffffff",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "none",
        }}
        className="erp-desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 9998,
          }}
        />
      )}

      {/* Mobile Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: "280px",
          backgroundColor: "#1e3a8a",
          zIndex: 9999,
          transform: isMobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease-in-out",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ position: "absolute", top: "16px", right: "12px", zIndex: 10 }}>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close navigation"
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px",
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        {sidebarContent}
      </div>

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        {/* Header / Top Bar */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="erp-mobile-menu-btn"
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px",
                cursor: "pointer",
                color: "#1e3a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuIcon size={20} />
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Portal</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>/</span>
                <span style={{ fontSize: "12px", color: "#1e3a8a", fontWeight: 600 }}>{title}</span>
              </div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "2px 0 0 0",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "9999px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: "12px",
                fontWeight: 600,
                color: "#166534",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "inline-block",
                }}
              />
              Database Live
            </div>

            {actions}
          </div>
        </header>

        {/* Page Content Body */}
        <main style={{ flex: 1, padding: "24px", maxWidth: "1440px", width: "100%", margin: "0 auto" }}>
          {subtitle && (
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "14px" }}>
              {subtitle}
            </p>
          )}
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .erp-desktop-sidebar {
            display: block !important;
          }
          .erp-mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
