"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import AddFeeForm from "../components/AddFeeForm";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  FeesIcon,
  CloseIcon,
} from "../components/Icons";
import { apiFetch, FeeRecord } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function FeesPage() {
  const { showToast, confirmAction } = useUI();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Paid" | "Partial" | "Pending">("ALL");
  const [editFee, setEditFee] = useState<FeeRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"id" | "name" | "remaining" | "date">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFees = useCallback(async () => {
    try {
      const { ok, data, message } = await apiFetch<FeeRecord[]>("/fees");
      if (ok && Array.isArray(data)) {
        setFees(data);
      } else {
        showToast(message || "Failed to load fee accounts.", "error");
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Network error while loading fee records.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<FeeRecord[]>("/fees")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && Array.isArray(data)) {
            setFees(data);
          } else {
            showToast(message || "Failed to load fee accounts.", "error");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error(err);
          showToast("Network error while loading fee records.", "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleEdit = (fee: FeeRecord) => {
    setEditFee(fee);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (fee: FeeRecord) => {
    confirmAction({
      title: "Delete Fee Account Record",
      message: `Are you sure you want to delete the fee record for ${fee.student_name} (Roll #${fee.roll_no})? This will delete this financial ledger entry from the database.`,
      confirmLabel: "Delete Fee Record",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { ok, data, message } = await apiFetch(`/fees/${fee.id}`, {
            method: "DELETE",
          });
          if (ok) {
            showToast(data?.message || "Fee record deleted successfully.", "success");
            fetchFees();
          } else {
            showToast(message || data?.message || "Failed to delete fee record.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Network error while deleting fee record.", "error");
        }
      },
    });
  };

  // Aggregated totals
  const totalInvoiced = useMemo(() => {
    return fees.reduce((acc, f) => acc + (Number(f.total_fees) || 0), 0);
  }, [fees]);

  const totalCollected = useMemo(() => {
    return fees.reduce((acc, f) => acc + (Number(f.paid_amount) || 0), 0);
  }, [fees]);

  const totalOutstanding = useMemo(() => {
    return fees.reduce((acc, f) => acc + (Number(f.remaining_amount) || 0), 0);
  }, [fees]);

  // Filtered and sorted data
  const processedFees = useMemo(() => {
    const filtered = fees.filter((f) => {
      const term = search.toLowerCase();
      const matchesSearch =
        f.student_name?.toLowerCase().includes(term) ||
        f.roll_no?.toLowerCase().includes(term) ||
        f.course_name?.toLowerCase().includes(term) ||
        f.payment_mode?.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id") comparison = a.id - b.id;
      else if (sortBy === "name") comparison = (a.student_name || "").localeCompare(b.student_name || "");
      else if (sortBy === "remaining") comparison = (Number(a.remaining_amount) || 0) - (Number(b.remaining_amount) || 0);
      else if (sortBy === "date") comparison = (a.payment_date || "").localeCompare(b.payment_date || "");

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [fees, search, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedFees.length / itemsPerPage) || 1;
  const paginatedFees = processedFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <button
      onClick={() => {
        setEditFee(null);
        setShowAddForm((prev) => !prev);
      }}
      className="erp-btn erp-btn-primary"
    >
      {showAddForm ? <CloseIcon size={16} /> : <PlusIcon size={16} />}
      {showAddForm ? "Hide Form" : "Record Payment"}
    </button>
  );

  const formatPaymentDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout
      title="Fee Collection & Accounts"
      subtitle="Tuition fee obligations, installment collections, payment instruments, and outstanding receivables."
      actions={headerActions}
    >
      {/* Financial Summary Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div className="erp-card" style={{ padding: "16px", borderLeft: "4px solid #2563eb" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Total Invoiced Obligations
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
            ₹ {totalInvoiced.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="erp-card" style={{ padding: "16px", borderLeft: "4px solid #16a34a" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Realized Collections
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: 700, color: "#16a34a" }}>
            ₹ {totalCollected.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="erp-card" style={{ padding: "16px", borderLeft: "4px solid #dc2626" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Outstanding Receivables
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: 700, color: "#dc2626" }}>
            ₹ {totalOutstanding.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Payment Entry Form */}
      {showAddForm && (
        <AddFeeForm
          key={editFee ? `edit-${editFee.id}` : "new-fee"}
          onFeeAdded={() => {
            fetchFees();
            setEditFee(null);
          }}
          editFee={editFee}
          setEditFee={setEditFee}
        />
      )}

      {/* Directory Section */}
      <div className="erp-card" style={{ padding: "20px" }}>
        {/* Controls & Filter Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "260px", flex: 1, maxWidth: "400px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by student, roll number, or course..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="erp-input"
              style={{ paddingLeft: "36px" }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["ALL", "Paid", "Partial", "Pending"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`erp-btn ${
                  statusFilter === tab ? "erp-btn-primary" : "erp-btn-secondary"
                }`}
                style={{ padding: "5px 12px", fontSize: "12px" }}
              >
                {tab === "ALL" ? "All Records" : tab}
              </button>
            ))}
          </div>

          {/* Sort Controls & Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="fees-sort" style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                Sort:
              </label>
              <select
                id="fees-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "name" | "remaining" | "date")}
                className="erp-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="id">Transaction ID</option>
                <option value="name">Student Name</option>
                <option value="remaining">Outstanding Amount</option>
                <option value="date">Payment Date</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="erp-btn erp-btn-secondary"
                style={{ padding: "6px 10px", fontSize: "12px" }}
                title="Toggle sort direction"
              >
                {sortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
              </button>
            </div>

            <span className="erp-badge erp-badge-neutral">
              {processedFees.length} {processedFees.length === 1 ? "Record" : "Accounts"}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th>Student / Roll No</th>
                <th>Program</th>
                <th>Total Invoiced</th>
                <th>Collected</th>
                <th>Remaining</th>
                <th>Instrument</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading financial fee records from database...
                  </td>
                </tr>
              ) : paginatedFees.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                      <FeesIcon size={36} />
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#334155" }}>
                      {search || statusFilter !== "ALL"
                        ? "No fee records match the selected filter"
                        : "No fee account records registered"}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      {search || statusFilter !== "ALL"
                        ? "Try clearing filters or search terms."
                        : "Click 'Record Payment' above to initiate the first fee collection."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedFees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <span className="erp-badge erp-badge-neutral">#{fee.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{fee.student_name}</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Roll: {fee.roll_no}</span>
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-info">{fee.course_name}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      ₹ {Number(fee.total_fees || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 600, color: "#16a34a" }}>
                      ₹ {Number(fee.paid_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 600, color: Number(fee.remaining_amount) > 0 ? "#dc2626" : "#16a34a" }}>
                      ₹ {Number(fee.remaining_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ color: "#475569", fontSize: "13px" }}>
                      {fee.payment_mode || "Online"}
                    </td>
                    <td style={{ color: "#64748b", fontSize: "13px" }}>
                      {formatPaymentDate(fee.payment_date)}
                    </td>
                    <td>
                      <span
                        className={`erp-badge ${
                          fee.status === "Paid"
                            ? "erp-badge-success"
                            : fee.status === "Partial"
                            ? "erp-badge-warning"
                            : "erp-badge-danger"
                        }`}
                      >
                        {fee.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(fee)}
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Record installment for ${fee.student_name}`}
                          title="Record installment or update payment"
                        >
                          <EditIcon size={14} /> Installment
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(fee)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Delete fee record for ${fee.student_name}`}
                        >
                          <TrashIcon size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "16px",
              marginTop: "8px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, processedFees.length)} of{" "}
              {processedFees.length} entries
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="erp-btn erp-btn-secondary"
                style={{ padding: "5px 12px", fontSize: "12px" }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`erp-btn ${currentPage === page ? "erp-btn-primary" : "erp-btn-secondary"}`}
                  style={{ padding: "5px 10px", fontSize: "12px", minWidth: "30px" }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="erp-btn erp-btn-secondary"
                style={{ padding: "5px 12px", fontSize: "12px" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}