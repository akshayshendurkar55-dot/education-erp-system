"use client";

import React, { useState } from "react";
import { apiFetch, Student } from "../../lib/api";
import { useUI } from "../../lib/UIContext";
import { CheckIcon, CloseIcon } from "./Icons";

interface AddStudentFormProps {
  onStudentAdded: () => void;
  editStudent?: Student | null;
  clearEdit?: () => void;
}

export default function AddStudentForm({
  onStudentAdded,
  editStudent,
  clearEdit,
}: AddStudentFormProps) {
  const { showToast } = useUI();
  const [fullName, setFullName] = useState(editStudent?.full_name || "");
  const [email, setEmail] = useState(editStudent?.email || "");
  const [mobile, setMobile] = useState(editStudent?.mobile || "");
  const [course, setCourse] = useState(editStudent?.course || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevEditStudent, setPrevEditStudent] = useState(editStudent);
  if (editStudent !== prevEditStudent) {
    setPrevEditStudent(editStudent);
    setFullName(editStudent?.full_name || "");
    setEmail(editStudent?.email || "");
    setMobile(editStudent?.mobile || "");
    setCourse(editStudent?.course || "");
    setFieldErrors({});
  }

  const resetFormFields = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setCourse("");
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full Name is required.";
    if (!email.trim() || !email.includes("@")) errors.email = "A valid Email address is required.";
    if (!mobile.trim() || mobile.trim().length < 7) errors.mobile = "A valid Contact Number is required.";
    if (!course.trim()) errors.course = "Enrolled Course name is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        course: course.trim(),
      };
      const targetUrl = editStudent
        ? `/students/${editStudent.id}`
        : "/students";

      const { ok, data, message } = await apiFetch(targetUrl, {
        method: editStudent ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        showToast(
          data?.message || (editStudent ? "Student record updated successfully." : "Student registered successfully."),
          "success"
        );
        resetFormFields();
        onStudentAdded();
        if (clearEdit) clearEdit();
      } else {
        showToast(message || data?.message || "Failed to save student record.", "error");
      }
    } catch (err: unknown) {
      console.error("Save student error:", err);
      showToast("Server connection failure while saving record.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="erp-card" style={{ padding: "20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {editStudent ? "Edit Student Details" : "Register New Student"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
            {editStudent ? `Updating record for Student ID #${editStudent.id}` : "Enroll a new student into an academic program"}
          </p>
        </div>

        {editStudent && (
          <span className="erp-badge erp-badge-info">Editing Mode</span>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Full Name */}
          <div>
            <label htmlFor="student-full-name" className="erp-label erp-label-required">
              Full Name
            </label>
            <input
              id="student-full-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.fullName ? "#ef4444" : undefined }}
            />
            {fieldErrors.fullName && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="student-email" className="erp-label erp-label-required">
              Email Address
            </label>
            <input
              id="student-email"
              type="email"
              placeholder="e.g. rahul.sharma@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.email ? "#ef4444" : undefined }}
            />
            {fieldErrors.email && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="student-mobile" className="erp-label erp-label-required">
              Mobile Number
            </label>
            <input
              id="student-mobile"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (fieldErrors.mobile) setFieldErrors((prev) => ({ ...prev, mobile: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.mobile ? "#ef4444" : undefined }}
            />
            {fieldErrors.mobile && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.mobile}
              </span>
            )}
          </div>

          {/* Course */}
          <div>
            <label htmlFor="student-course" className="erp-label erp-label-required">
              Enrolled Course / Batch
            </label>
            <input
              id="student-course"
              type="text"
              placeholder="e.g. B.Tech Computer Science"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                if (fieldErrors.course) setFieldErrors((prev) => ({ ...prev, course: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.course ? "#ef4444" : undefined }}
            />
            {fieldErrors.course && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.course}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editStudent && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                resetFormFields();
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
              : editStudent
              ? "Update Student Record"
              : "Register Student"}
          </button>
        </div>
      </form>
    </div>
  );
}