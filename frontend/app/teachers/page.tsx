"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import AddTeacherForm from "../components/AddTeacherForm";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  TeachersIcon,
  CloseIcon,
} from "../components/Icons";
import { apiFetch, Teacher } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function TeachersPage() {
  const { showToast, confirmAction } = useUI();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"id" | "name" | "subject">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTeachers = useCallback(async () => {
    try {
      const { ok, data, message } = await apiFetch<Teacher[]>("/teachers");
      if (ok && Array.isArray(data)) {
        setTeachers(data);
      } else {
        showToast(message || "Failed to load faculty directory.", "error");
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Network error while loading faculty list.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<Teacher[]>("/teachers")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && Array.isArray(data)) {
            setTeachers(data);
          } else {
            showToast(message || "Failed to load faculty directory.", "error");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error(err);
          showToast("Network error while loading faculty list.", "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (teacher: Teacher) => {
    confirmAction({
      title: "Remove Faculty Member",
      message: `Are you sure you want to remove ${teacher.full_name} (ID #${teacher.id}) from the faculty directory? This action cannot be undone.`,
      confirmLabel: "Remove Faculty",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { ok, data, message } = await apiFetch(`/teachers/${teacher.id}`, {
            method: "DELETE",
          });
          if (ok) {
            showToast(data?.message || "Faculty record removed successfully.", "success");
            fetchTeachers();
          } else {
            showToast(message || data?.message || "Failed to remove teacher.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Network error while removing faculty record.", "error");
        }
      },
    });
  };

  // Filtered and sorted data
  const processedTeachers = useMemo(() => {
    const filtered = teachers.filter((t) => {
      const term = search.toLowerCase();
      return (
        t.full_name?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term) ||
        t.subject?.toLowerCase().includes(term) ||
        t.mobile?.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id") comparison = a.id - b.id;
      else if (sortBy === "name") comparison = (a.full_name || "").localeCompare(b.full_name || "");
      else if (sortBy === "subject") comparison = (a.subject || "").localeCompare(b.subject || "");

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [teachers, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = processedTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <button
      onClick={() => {
        setEditTeacher(null);
        setShowAddForm((prev) => !prev);
      }}
      className="erp-btn erp-btn-primary"
    >
      {showAddForm ? <CloseIcon size={16} /> : <PlusIcon size={16} />}
      {showAddForm ? "Hide Form" : "Add Faculty"}
    </button>
  );

  return (
    <AppLayout
      title="Faculty & Teachers Management"
      subtitle="Complete faculty roster, subject specializations, and departmental contacts."
      actions={headerActions}
    >
      {/* Registration/Edit Form */}
      {showAddForm && (
        <AddTeacherForm
          key={editTeacher ? `edit-${editTeacher.id}` : "new-teacher"}
          onTeacherAdded={() => {
            fetchTeachers();
            setEditTeacher(null);
          }}
          editTeacher={editTeacher}
          clearEdit={() => {
            setEditTeacher(null);
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
              placeholder="Search faculty by name, department, or email..."
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
              <label htmlFor="teacher-sort" style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                Sort by:
              </label>
              <select
                id="teacher-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "name" | "subject")}
                className="erp-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="id">Faculty ID</option>
                <option value="name">Instructor Name</option>
                <option value="subject">Department / Subject</option>
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
              {processedTeachers.length} {processedTeachers.length === 1 ? "Instructor" : "Faculty Members"}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Instructor Name</th>
                <th>Email Address</th>
                <th>Contact</th>
                <th>Department / Specialization</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading faculty records from database...
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                      <TeachersIcon size={36} />
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#334155" }}>
                      {search ? "No matching instructors found" : "No faculty members available"}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      {search ? "Try searching with a different keyword." : "Click 'Add Faculty' above to register the first instructor."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <span className="erp-badge erp-badge-neutral">#{teacher.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {teacher.full_name}
                    </td>
                    <td style={{ color: "#475569" }}>{teacher.email}</td>
                    <td style={{ color: "#475569" }}>{teacher.mobile || "—"}</td>
                    <td>
                      <span className="erp-badge erp-badge-info">{teacher.subject || "General"}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(teacher)}
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Edit ${teacher.full_name}`}
                        >
                          <EditIcon size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(teacher)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Delete ${teacher.full_name}`}
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
              {Math.min(currentPage * itemsPerPage, processedTeachers.length)} of{" "}
              {processedTeachers.length} entries
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