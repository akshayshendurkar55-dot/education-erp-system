"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import AddStudentForm from "../components/AddStudentForm";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  StudentsIcon,
  CloseIcon,
} from "../components/Icons";
import { apiFetch, Student } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function StudentsPage() {
  const { showToast, confirmAction } = useUI();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"id" | "name" | "course">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      const { ok, data, message } = await apiFetch<Student[]>("/students");
      if (ok && Array.isArray(data)) {
        setStudents(data);
      } else {
        showToast(message || "Failed to load student records.", "error");
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Network error while loading students list.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<Student[]>("/students")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && Array.isArray(data)) {
            setStudents(data);
          } else {
            showToast(message || "Failed to load student records.", "error");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error(err);
          showToast("Network error while loading students list.", "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (student: Student) => {
    confirmAction({
      title: "Delete Student Record",
      message: `Are you sure you want to delete ${student.full_name} (ID #${student.id}) from the database? This action cannot be undone.`,
      confirmLabel: "Delete Student",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { ok, data, message } = await apiFetch(`/students/${student.id}`, {
            method: "DELETE",
          });
          if (ok) {
            showToast(data?.message || "Student deleted successfully.", "success");
            fetchStudents();
          } else {
            showToast(message || data?.message || "Failed to delete student.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Network error while deleting student.", "error");
        }
      },
    });
  };

  // Filtered and sorted data
  const processedStudents = useMemo(() => {
    const filtered = students.filter((s) => {
      const term = search.toLowerCase();
      return (
        s.full_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.course?.toLowerCase().includes(term) ||
        s.mobile?.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id") comparison = a.id - b.id;
      else if (sortBy === "name") comparison = (a.full_name || "").localeCompare(b.full_name || "");
      else if (sortBy === "course") comparison = (a.course || "").localeCompare(b.course || "");

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [students, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedStudents.length / itemsPerPage) || 1;
  const paginatedStudents = processedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <button
      onClick={() => {
        setEditStudent(null);
        setShowAddForm((prev) => !prev);
      }}
      className="erp-btn erp-btn-primary"
    >
      {showAddForm ? <CloseIcon size={16} /> : <PlusIcon size={16} />}
      {showAddForm ? "Hide Form" : "Add Student"}
    </button>
  );

  return (
    <AppLayout
      title="Students Management"
      subtitle="Complete student enrollment roster, academic programs, and directory records."
      actions={headerActions}
    >
      {/* Registration/Edit Form */}
      {showAddForm && (
        <AddStudentForm
          key={editStudent ? `edit-${editStudent.id}` : "new-student"}
          onStudentAdded={() => {
            fetchStudents();
            setEditStudent(null);
          }}
          editStudent={editStudent}
          clearEdit={() => {
            setEditStudent(null);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Directory Roster Section */}
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
              placeholder="Search by student name, email, or course..."
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
              <label htmlFor="student-sort" style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                Sort by:
              </label>
              <select
                id="student-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "name" | "course")}
                className="erp-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="id">Student ID</option>
                <option value="name">Full Name</option>
                <option value="course">Course</option>
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
              {processedStudents.length} {processedStudents.length === 1 ? "Student" : "Students"}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Contact</th>
                <th>Enrolled Course</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading student records from database...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                      <StudentsIcon size={36} />
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#334155" }}>
                      {search ? "No matching students found" : "No student records available"}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      {search ? "Try searching with a different term." : "Click 'Add Student' above to enroll the first candidate."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className="erp-badge erp-badge-neutral">#{student.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {student.full_name}
                    </td>
                    <td style={{ color: "#475569" }}>{student.email}</td>
                    <td style={{ color: "#475569" }}>{student.mobile}</td>
                    <td>
                      <span className="erp-badge erp-badge-info">{student.course}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Edit ${student.full_name}`}
                        >
                          <EditIcon size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Delete ${student.full_name}`}
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
              {Math.min(currentPage * itemsPerPage, processedStudents.length)} of{" "}
              {processedStudents.length} entries
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