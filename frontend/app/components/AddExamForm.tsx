"use client";

import React, { useState } from "react";
import { apiFetch, Exam } from "../../lib/api";
import { useUI } from "../../lib/UIContext";
import { CheckIcon, CloseIcon } from "./Icons";

interface AddExamFormProps {
  onExamAdded: () => void;
  editExam?: Exam | null;
  clearEdit?: () => void;
}

function formatDateString(dateStr?: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr.split("T")[0];
  if (dateStr.length > 10) return dateStr.substring(0, 10);
  return dateStr;
}

export default function AddExamForm({
  onExamAdded,
  editExam,
  clearEdit,
}: AddExamFormProps) {
  const { showToast } = useUI();
  const [examName, setExamName] = useState(editExam?.exam_name || "");
  const [courseName, setCourseName] = useState(editExam?.course_name || "");
  const [examDate, setExamDate] = useState(formatDateString(editExam?.exam_date));
  const [totalMarks, setTotalMarks] = useState(editExam?.total_marks?.toString() || "100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevEditExam, setPrevEditExam] = useState(editExam);
  if (editExam !== prevEditExam) {
    setPrevEditExam(editExam);
    setExamName(editExam?.exam_name || "");
    setCourseName(editExam?.course_name || "");
    setExamDate(formatDateString(editExam?.exam_date));
    setTotalMarks(editExam?.total_marks?.toString() || "100");
    setFieldErrors({});
  }

  const resetForm = () => {
    setExamName("");
    setCourseName("");
    setExamDate("");
    setTotalMarks("100");
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!examName.trim()) errors.examName = "Exam Title is required.";
    if (!courseName.trim()) errors.courseName = "Associated Course Name is required.";
    if (!examDate.trim() || isNaN(Date.parse(examDate))) errors.examDate = "A valid Examination Date is required.";
    const marks = parseInt(totalMarks, 10);
    if (isNaN(marks) || marks <= 0) errors.totalMarks = "Total Marks must be a positive integer.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        exam_name: examName.trim(),
        course_name: courseName.trim(),
        exam_date: examDate,
        total_marks: parseInt(totalMarks, 10) || 100,
      };

      const targetUrl = editExam
        ? `/exams/${editExam.id}`
        : "/exams";

      const { ok, data, message } = await apiFetch(targetUrl, {
        method: editExam ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        showToast(
          data?.message || (editExam ? "Examination schedule updated successfully." : "Examination scheduled successfully."),
          "success"
        );
        resetForm();
        onExamAdded();
        if (clearEdit) clearEdit();
      } else {
        showToast(message || data?.message || "Failed to save examination schedule.", "error");
      }
    } catch (err: unknown) {
      console.error("Exam save error:", err);
      showToast("Server connection failure while saving examination.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="erp-card" style={{ padding: "20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {editExam ? "Edit Examination Schedule" : "Schedule New Examination"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
            {editExam ? `Updating examination for ID #${editExam.id}` : "Configure exam timetable, target course, and maximum evaluation marks"}
          </p>
        </div>

        {editExam && (
          <span className="erp-badge erp-badge-info">Editing Mode</span>
        )}
      </div>

      <form onSubmit={handleCreateExam}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Exam Title */}
          <div>
            <label htmlFor="exam-name" className="erp-label erp-label-required">
              Examination Title
            </label>
            <input
              id="exam-name"
              type="text"
              placeholder="e.g. Mid-Term Advanced Mathematics"
              value={examName}
              onChange={(e) => {
                setExamName(e.target.value);
                if (fieldErrors.examName) setFieldErrors((prev) => ({ ...prev, examName: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.examName ? "#ef4444" : undefined }}
            />
            {fieldErrors.examName && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.examName}
              </span>
            )}
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="exam-course" className="erp-label erp-label-required">
              Associated Course / Degree Batch
            </label>
            <input
              id="exam-course"
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

          {/* Exam Date */}
          <div>
            <label htmlFor="exam-date" className="erp-label erp-label-required">
              Scheduled Date
            </label>
            <input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => {
                setExamDate(e.target.value);
                if (fieldErrors.examDate) setFieldErrors((prev) => ({ ...prev, examDate: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.examDate ? "#ef4444" : undefined }}
            />
            {fieldErrors.examDate && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.examDate}
              </span>
            )}
          </div>

          {/* Total Marks */}
          <div>
            <label htmlFor="exam-marks" className="erp-label erp-label-required">
              Maximum Total Marks
            </label>
            <input
              id="exam-marks"
              type="number"
              min="1"
              placeholder="e.g. 100"
              value={totalMarks}
              onChange={(e) => {
                setTotalMarks(e.target.value);
                if (fieldErrors.totalMarks) setFieldErrors((prev) => ({ ...prev, totalMarks: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.totalMarks ? "#ef4444" : undefined }}
            />
            {fieldErrors.totalMarks && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.totalMarks}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editExam && (
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
              : editExam
              ? "Update Examination"
              : "Schedule Examination"}
          </button>
        </div>
      </form>
    </div>
  );
}