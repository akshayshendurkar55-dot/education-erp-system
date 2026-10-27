"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import AddCourseForm from "../components/AddCourseForm";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CoursesIcon,
  CloseIcon,
} from "../components/Icons";
import { apiFetch, Course } from "../../lib/api";
import { useUI } from "../../lib/UIContext";

export default function CoursesPage() {
  const { showToast, confirmAction } = useUI();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"id" | "name" | "fees">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCourses = useCallback(async () => {
    try {
      const { ok, data, message } = await apiFetch<Course[]>("/courses");
      if (ok && Array.isArray(data)) {
        setCourses(data);
      } else {
        showToast(message || "Failed to load courses catalog.", "error");
      }
    } catch (err: unknown) {
      console.error(err);
      showToast("Network error while loading course programs.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    apiFetch<Course[]>("/courses")
      .then(({ ok, data, message }) => {
        if (!ignore) {
          if (ok && Array.isArray(data)) {
            setCourses(data);
          } else {
            showToast(message || "Failed to load courses catalog.", "error");
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error(err);
          showToast("Network error while loading course programs.", "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleEdit = (course: Course) => {
    setEditCourse(course);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (course: Course) => {
    confirmAction({
      title: "Delete Course Batch",
      message: `Are you sure you want to delete ${course.course_name} (${course.course_code})? This will affect academic schedules linked to this course.`,
      confirmLabel: "Delete Course",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { ok, data, message } = await apiFetch(`/courses/${course.id}`, {
            method: "DELETE",
          });
          if (ok) {
            showToast(data?.message || "Course program deleted successfully.", "success");
            fetchCourses();
          } else {
            showToast(message || data?.message || "Failed to delete course.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Network error while deleting course.", "error");
        }
      },
    });
  };

  // Filtered and sorted data
  const processedCourses = useMemo(() => {
    const filtered = courses.filter((c) => {
      const term = search.toLowerCase();
      return (
        c.course_name?.toLowerCase().includes(term) ||
        c.course_code?.toLowerCase().includes(term) ||
        c.duration?.toLowerCase().includes(term)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id") comparison = a.id - b.id;
      else if (sortBy === "name") comparison = (a.course_name || "").localeCompare(b.course_name || "");
      else if (sortBy === "fees") comparison = (Number(a.fees) || 0) - (Number(b.fees) || 0);

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [courses, search, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedCourses.length / itemsPerPage) || 1;
  const paginatedCourses = processedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerActions = (
    <button
      onClick={() => {
        setEditCourse(null);
        setShowAddForm((prev) => !prev);
      }}
      className="erp-btn erp-btn-primary"
    >
      {showAddForm ? <CloseIcon size={16} /> : <PlusIcon size={16} />}
      {showAddForm ? "Hide Form" : "Add Course"}
    </button>
  );

  return (
    <AppLayout
      title="Course Programs & Curriculum"
      subtitle="Degree batches, catalog codes, standard durations, and approved fee structures."
      actions={headerActions}
    >
      {/* Registration/Edit Form */}
      {showAddForm && (
        <AddCourseForm
          key={editCourse ? `edit-${editCourse.id}` : "new-course"}
          onCourseAdded={() => {
            fetchCourses();
            setEditCourse(null);
          }}
          editCourse={editCourse}
          clearEdit={() => {
            setEditCourse(null);
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
              placeholder="Search course by name or catalog code..."
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
              <label htmlFor="course-sort" style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                Sort by:
              </label>
              <select
                id="course-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "name" | "fees")}
                className="erp-input"
                style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
              >
                <option value="id">Course ID</option>
                <option value="name">Course Name</option>
                <option value="fees">Tuition Fees</option>
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
              {processedCourses.length} {processedCourses.length === 1 ? "Program" : "Programs"}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Program / Course Name</th>
                <th>Catalog Code</th>
                <th>Duration</th>
                <th>Tuition Fees</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading academic courses from database...
                  </td>
                </tr>
              ) : paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}>
                      <CoursesIcon size={36} />
                    </div>
                    <p style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 600, color: "#334155" }}>
                      {search ? "No matching programs found" : "No course programs available"}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      {search ? "Try searching with a different keyword." : "Click 'Add Course' above to create the first curriculum batch."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="erp-badge erp-badge-neutral">#{course.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {course.course_name}
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-info">{course.course_code}</span>
                    </td>
                    <td style={{ color: "#475569" }}>{course.duration || "—"}</td>
                    <td style={{ fontWeight: 600, color: "#059669" }}>
                      ₹ {Number(course.fees || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(course)}
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Edit ${course.course_name}`}
                        >
                          <EditIcon size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: "5px 10px", fontSize: "12px" }}
                          aria-label={`Delete ${course.course_name}`}
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
              {Math.min(currentPage * itemsPerPage, processedCourses.length)} of{" "}
              {processedCourses.length} entries
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