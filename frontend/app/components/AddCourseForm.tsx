"use client";

import React, { useState } from "react";
import { apiFetch, Course } from "../../lib/api";
import { useUI } from "../../lib/UIContext";
import { CheckIcon, CloseIcon } from "./Icons";

interface AddCourseFormProps {
  onCourseAdded: () => void;
  editCourse?: Course | null;
  clearEdit?: () => void;
}

export default function AddCourseForm({
  onCourseAdded,
  editCourse,
  clearEdit,
}: AddCourseFormProps) {
  const { showToast } = useUI();
  const [courseName, setCourseName] = useState(editCourse?.course_name || "");
  const [courseCode, setCourseCode] = useState(editCourse?.course_code || "");
  const [duration, setDuration] = useState(editCourse?.duration || "");
  const [fees, setFees] = useState(editCourse?.fees?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevEditCourse, setPrevEditCourse] = useState(editCourse);
  if (editCourse !== prevEditCourse) {
    setPrevEditCourse(editCourse);
    setCourseName(editCourse?.course_name || "");
    setCourseCode(editCourse?.course_code || "");
    setDuration(editCourse?.duration || "");
    setFees(editCourse?.fees?.toString() || "");
    setFieldErrors({});
  }

  const resetForm = () => {
    setCourseName("");
    setCourseCode("");
    setDuration("");
    setFees("");
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!courseName.trim()) errors.courseName = "Course Name is required.";
    if (!courseCode.trim()) errors.courseCode = "Course Code is required (e.g. CS-101).";
    if (fees !== "" && isNaN(Number(fees))) errors.fees = "Total fees must be a valid number.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        duration: duration.trim(),
        fees: Number(fees) || 0,
      };

      const targetUrl = editCourse
        ? `/courses/${editCourse.id}`
        : "/courses";

      const { ok, data, message } = await apiFetch(targetUrl, {
        method: editCourse ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        showToast(
          data?.message || (editCourse ? "Course updated successfully." : "Course batch created successfully."),
          "success"
        );
        resetForm();
        onCourseAdded();
        if (clearEdit) clearEdit();
      } else {
        showToast(message || data?.message || "Failed to save course details.", "error");
      }
    } catch (err: unknown) {
      console.error("Course save error:", err);
      showToast("Server connection failure while saving course.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="erp-card" style={{ padding: "20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {editCourse ? "Edit Academic Course Batch" : "Create New Course Batch"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
            {editCourse ? `Updating curriculum for Course ID #${editCourse.id}` : "Configure degree program duration, code, and total tuition fees"}
          </p>
        </div>

        {editCourse && (
          <span className="erp-badge erp-badge-info">Editing Mode</span>
        )}
      </div>

      <form onSubmit={handleSaveCourse}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Course Name */}
          <div>
            <label htmlFor="course-name" className="erp-label erp-label-required">
              Course / Degree Program Name
            </label>
            <input
              id="course-name"
              type="text"
              placeholder="e.g. B.Tech Computer Science"
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (fieldErrors.courseName) setFieldErrors((prev) => ({ ...prev, courseName: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.courseName ? "#ef4444" : undefined }}
            />
            {fieldErrors.courseName && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.courseName}
              </span>
            )}
          </div>

          {/* Course Code */}
          <div>
            <label htmlFor="course-code" className="erp-label erp-label-required">
              Course Code / Catalog ID
            </label>
            <input
              id="course-code"
              type="text"
              placeholder="e.g. CS-2026"
              value={courseCode}
              onChange={(e) => {
                setCourseCode(e.target.value);
                if (fieldErrors.courseCode) setFieldErrors((prev) => ({ ...prev, courseCode: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.courseCode ? "#ef4444" : undefined }}
            />
            {fieldErrors.courseCode && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.courseCode}
              </span>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="course-duration" className="erp-label">
              Duration / Academic Semesters
            </label>
            <input
              id="course-duration"
              type="text"
              placeholder="e.g. 4 Years (8 Semesters)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="erp-input"
            />
          </div>

          {/* Fees */}
          <div>
            <label htmlFor="course-fees" className="erp-label">
              Total Tuition Fees (₹)
            </label>
            <input
              id="course-fees"
              type="number"
              min="0"
              placeholder="e.g. 120000"
              value={fees}
              onChange={(e) => {
                setFees(e.target.value);
                if (fieldErrors.fees) setFieldErrors((prev) => ({ ...prev, fees: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.fees ? "#ef4444" : undefined }}
            />
            {fieldErrors.fees && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.fees}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editCourse && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                resetForm();
                if (clearEdit) clearEdit();
              }}
              className="erp-btn erp-btn-outline"
            >
              <CloseIcon size={16} /> Cancel Editing
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="erp-btn erp-btn-primary"
          >
            <CheckIcon size={16} />
            {isSubmitting
              ? "Saving..."
              : editCourse
              ? "Update Program Details"
              : "Save Course Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}