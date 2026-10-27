"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import {
  StudentsIcon,
  TeachersIcon,
  CoursesIcon,
  ExamsIcon,
  FeesIcon,
  RefreshIcon,
  AlertCircleIcon,
} from "../components/Icons";
import { apiFetch, DashboardStats } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function DashboardPage() {
  const { showToast } = useUI();
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    courses: 0,
    exams: 0,
    fees: 0,
    pendingFees: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
      setError(null);
    }

    try {
      const { ok, data, message } = await apiFetch<DashboardStats>("/dashboard");

      if (ok && data) {
        setStats({
          students: Number(data.students) || 0,
          teachers: Number(data.teachers) || 0,
          courses: Number(data.courses) || 0,
          exams: Number(data.exams) || 0,
          fees: Number(data.fees) || 0,
          pendingFees: Number(data.pendingFees) || 0,
        });
        setError(null);

        const now = new Date();
        setLastRefreshed(
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );

        if (isManual) {
          showToast("Dashboard metrics refreshed successfully", "success");
        }
      } else {
        setError(message || "Failed to load dashboard metrics.");
      }
    } catch (err: unknown) {
      console.error("Dashboard error:", err);
      setError("Network error: Unable to connect to backend service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<DashboardStats>("/dashboard")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && data) {
            setStats({
              students: Number(data.students) || 0,
              teachers: Number(data.teachers) || 0,
              courses: Number(data.courses) || 0,
              exams: Number(data.exams) || 0,
              fees: Number(data.fees) || 0,
              pendingFees: Number(data.pendingFees) || 0,
            });
            setError(null);

            const now = new Date();
            setLastRefreshed(
              now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            );
          } else {
            setError(message || "Failed to load dashboard metrics.");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Dashboard error:", err);
          setError("Network error: Unable to connect to backend service.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totalFeeTarget = stats.fees + stats.pendingFees;
  const collectionRate = totalFeeTarget > 0 ? Math.round((stats.fees / totalFeeTarget) * 100) : 0;
  const studentTeacherRatio = stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : "N/A";

  const refreshAction = useMemo(
    () => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {lastRefreshed && (
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Updated at {lastRefreshed}
          </span>
        )}
        <button
          type="button"
          disabled={loading || refreshing}
          onClick={() => fetchDashboard(true)}
          className="erp-btn erp-btn-secondary"
          style={{ padding: "6px 12px", fontSize: "13px" }}
        >
          <RefreshIcon
            size={14}
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    ),
    [lastRefreshed, loading, refreshing, fetchDashboard]
  );

  return (
    <AppLayout
      title="Executive Administration Dashboard"
      subtitle="Real-time institutional metrics aggregated from PostgreSQL database records."
      actions={refreshAction}
    >
      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircleIcon size={20} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            className="erp-btn erp-btn-danger"
            style={{ padding: "4px 12px", fontSize: "12px" }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Metric 1: Students */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #2563eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Students
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <StudentsIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            {loading ? "..." : stats.students.toLocaleString()}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#16a34a", fontWeight: 500 }}>
            Active Registrations
          </p>
        </div>

        {/* Metric 2: Teachers */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #16a34a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Faculty Members
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TeachersIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            {loading ? "..." : stats.teachers.toLocaleString()}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            Ratio: {studentTeacherRatio} : 1
          </p>
        </div>

        {/* Metric 3: Courses */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #d97706" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Academic Programs
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CoursesIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            {loading ? "..." : stats.courses.toLocaleString()}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            Active Curriculum Batches
          </p>
        </div>

        {/* Metric 4: Exams */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #7c3aed" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Examinations
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ExamsIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            {loading ? "..." : stats.exams.toLocaleString()}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            Scheduled Sessions
          </p>
        </div>

        {/* Metric 5: Collected Fees */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #059669" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Collected Revenue
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FeesIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#059669" }}>
            {loading ? "..." : `₹ ${stats.fees.toLocaleString("en-IN")}`}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
            {collectionRate}% of Total Invoiced
          </p>
        </div>

        {/* Metric 6: Pending Fees */}
        <div className="erp-card" style={{ padding: "20px", borderLeft: "4px solid #dc2626" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Outstanding Dues
            </span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FeesIcon size={18} />
            </div>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#dc2626" }}>
            {loading ? "..." : `₹ ${stats.pendingFees.toLocaleString("en-IN")}`}
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#b91c1c" }}>
            Pending Realization
          </p>
        </div>
      </div>

      {/* Analytics & Quick Operations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Fee Collection Progress Analysis */}
        <div className="erp-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
            Financial Realization & Collection Efficiency
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
              <span style={{ color: "#475569" }}>Target Collection Realization</span>
              <span style={{ fontWeight: 700, color: "#15803d" }}>{collectionRate}%</span>
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${collectionRate}%`,
                  height: "100%",
                  backgroundColor: "#16a34a",
                  borderRadius: "6px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Realized Cashflow</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>
                ₹ {stats.fees.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Receivables (Unpaid)</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#dc2626" }}>
                ₹ {stats.pendingFees.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Administrative Operations */}
        <div className="erp-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px 0" }}>
            Administrative Modules & Quick Navigation
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/students" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <StudentsIcon size={18} />
                  <span>Manage Student Records</span>
                </div>
                <span className="erp-badge erp-badge-neutral">{stats.students} Records</span>
              </div>
            </Link>

            <Link href="/teachers" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <TeachersIcon size={18} />
                  <span>Faculty Directory & Assignments</span>
                </div>
                <span className="erp-badge erp-badge-neutral">{stats.teachers} Faculty</span>
              </div>
            </Link>

            <Link href="/courses" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CoursesIcon size={18} />
                  <span>Academic Curriculum & Programs</span>
                </div>
                <span className="erp-badge erp-badge-neutral">{stats.courses} Batches</span>
              </div>
            </Link>

            <Link href="/exams" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <ExamsIcon size={18} />
                  <span>Examination Timetable & Marks</span>
                </div>
                <span className="erp-badge erp-badge-neutral">{stats.exams} Scheduled</span>
              </div>
            </Link>

            <Link href="/fees" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FeesIcon size={18} />
                  <span>Fee Collection & Installments</span>
                </div>
                <span className="erp-badge erp-badge-success">₹ Receipts Live</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}