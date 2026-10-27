"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import AddExamForm from "../components/AddExamForm";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ExamsIcon,
  CloseIcon,
} from "../components/Icons";
import { apiFetch, Exam } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function ExamsPage() {
  const { showToast, confirmAction } = useUI();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"id" | "name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchExams = useCallback(async () => {
    try {
      const { ok, data, message } = await apiFetch<Exam[]>("/exams");
      if (ok && Array.isArray(data)) {
        setExams(data);
      } else {
        showToast(message || "Failed to load examination timetable.", "error");
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Network error while loading examination list.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<Exam[]>("/exams")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && Array.isArray(data)) {
            setExams(data);
          } else {
            showToast(message || "Failed to load examination timetable.", "error");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error(err);
          showToast("Network error while loading examination list.", "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleEdit = (exam: Exam) => {
    setEditExam(exam);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (exam: Exam) => {
    confirmAction({
      title: "Cancel Examination Schedule",
      message: `Are you sure you want to delete ${exam.exam_name} (${exam.course_name})? This will remove this scheduled assessment session.`,
      confirmLabel: "Delete Examination",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { ok, data, message } = await apiFetch(`/exams/${exam.id}`, {
            method: "DELETE",
          });
          if (ok) {
            showToast(data?.message || "Examination schedule removed successfully.", "success");
            fetchExams();
          } else {
            showToast(message || data?.message || "Failed to remove examination.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Network error while deleting examination.", "error");
        }
      },
    });
  };

  // Filtered and sorted data
  const processedExams = useMemo(() => {
    const filtered = exams.filter((e) => {
      const term = search.toLowerCase();
      return (
        e.exam_name?.toLowerCase().includes(term) ||
        e.course_name?.toLowerCase().includes(term) ||
        e.exam_date?.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id") comparison = a.id - b.id;
      else if (sortBy === "name") comparison = (a.exam_name || "").localeCompare(b.exam_name || "");
      else if (sortBy === "date") comparison = (a.exam_date || "").localeCompare(b.exam_date || "");

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [exams, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedExams.length / itemsPerPage) || 1;
  const paginatedExams = processedExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <button
      onClick={() => {
        setEditExam(null);
        setShowAddForm((prev) => !prev);
      }}
      className="erp-btn erp-btn-primary"
    >
      {showAddForm ? <CloseIcon size={16} /> : <PlusIcon size={16} />}
      {showAddForm ? "Hide Form" : "Schedule Exam"}
    </button>
  );

  const formatExamDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
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
      title="Examinations & Timetable"
      subtitle="Schedule assessment sessions, configure maximum marks, and manage academic evaluation calendars."
      actions={headerActions}
    >
      {/* Registration/Edit Form */}
      {showAddForm && (
        <AddExamForm
          key={editExam ? `edit-${editExam.id}` : "new-exam"}
          onExamAdded={() => {
            fetchExams();
            setEditExam(null);
          }}
          editExam={editExam}
          clearEdit={() => {
            setEditExam(null);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Directory Section */}
      <div className="erp-card" style={{ padding: "20px" }}>
        {/* Controls Bar */}
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
              placeholder="Search by exam title or course program..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="erp-input"
              style={{ paddingLeft: "36px" }}
            />
          </div>

          {/* Sort Controls & Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="exam-sort" style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                Sort by:
              </label>
              <select
                id="exam-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "name" | "date")}
                className="erp-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="date">Exam Date</option>
                <option value="id">Exam ID</option>
                <option value="name">Exam Title</option>
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
              {processedExams.length} {processedExams.length === 1 ? "Session" : "Exam Sessions"}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Examination Title</th>
                <th>Associated Program</th>
                <th>Scheduled Date</th>
                <th>Max Marks</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading examination calendar from database...
                  </td>
                </tr>
              ) : paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                      <ExamsIcon size={36} />
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#334155" }}>
                      {search ? "No matching examinations found" : "No examination timetable scheduled"}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      {search ? "Try searching with a different exam title." : "Click 'Schedule Exam' above to add the first assessment."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedExams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <span className="erp-badge erp-badge-neutral">#{exam.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {exam.exam_name}
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-info">{exam.course_name}</span>
                    </td>
                    <td style={{ color: "#475569", fontWeight: 500 }}>
                      📅 {formatExamDate(exam.exam_date)}
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-neutral">{exam.total_marks} Marks</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(exam)}
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Edit ${exam.exam_name}`}
                        >
                          <EditIcon size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exam)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Delete ${exam.exam_name}`}
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
              {Math.min(currentPage * itemsPerPage, processedExams.length)} of{" "}
              {processedExams.length} entries
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