"use client";

import React, { useState } from "react";
import { apiFetch, Teacher } from "../../lib/api";
import { useUI } from "../../lib/UIContext";
import { CheckIcon, CloseIcon } from "./Icons";

interface AddTeacherFormProps {
  onTeacherAdded: () => void;
  editTeacher?: Teacher | null;
  clearEdit?: () => void;
}

export default function AddTeacherForm({
  onTeacherAdded,
  editTeacher,
  clearEdit,
}: AddTeacherFormProps) {
  const { showToast } = useUI();
  const [name, setName] = useState(editTeacher?.full_name || "");
  const [emailId, setEmailId] = useState(editTeacher?.email || "");
  const [phone, setPhone] = useState(editTeacher?.mobile || "");
  const [assignedSubject, setAssignedSubject] = useState(editTeacher?.subject || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevEditTeacher, setPrevEditTeacher] = useState(editTeacher);
  if (editTeacher !== prevEditTeacher) {
    setPrevEditTeacher(editTeacher);
    setName(editTeacher?.full_name || "");
    setEmailId(editTeacher?.email || "");
    setPhone(editTeacher?.mobile || "");
    setAssignedSubject(editTeacher?.subject || "");
    setFieldErrors({});
  }

  const resetForm = () => {
    setName("");
    setEmailId("");
    setPhone("");
    setAssignedSubject("");
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Teacher Name is required.";
    if (!emailId.trim() || !emailId.includes("@")) errors.emailId = "A valid Email address is required.";
    if (!phone.trim() || phone.trim().length < 7) errors.phone = "A valid Contact Number is required.";
    if (!assignedSubject.trim()) errors.assignedSubject = "Subject / Department is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const bodyData = {
        fullName: name.trim(),
        email: emailId.trim().toLowerCase(),
        mobile: phone.trim(),
        subject: assignedSubject.trim(),
      };

      const targetUrl = editTeacher
        ? `/teachers/${editTeacher.id}`
        : "/teachers";

      const { ok, data, message } = await apiFetch(targetUrl, {
        method: editTeacher ? "PUT" : "POST",
        body: JSON.stringify(bodyData),
      });

      if (ok) {
        showToast(
          data?.message || (editTeacher ? "Faculty record updated successfully." : "Faculty member registered successfully."),
          "success"
        );
        resetForm();
        onTeacherAdded();
        if (clearEdit) clearEdit();
      } else {
        showToast(message || data?.message || "Failed to save teacher details.", "error");
      }
    } catch (err: unknown) {
      console.error("Teacher submit error:", err);
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
            {editTeacher ? "Edit Faculty Profile" : "Register Faculty Member"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
            {editTeacher ? `Updating profile for Faculty ID #${editTeacher.id}` : "Add an instructor or professor to the academic directory"}
          </p>
        </div>

        {editTeacher && (
          <span className="erp-badge erp-badge-info">Editing Mode</span>
        )}
      </div>

      <form onSubmit={handleSubmitTeacher}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {/* Teacher Name */}
          <div>
            <label htmlFor="teacher-full-name" className="erp-label erp-label-required">
              Full Name
            </label>
            <input
              id="teacher-full-name"
              type="text"
              placeholder="e.g. Dr. Priya Patel"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.name ? "#ef4444" : undefined }}
            />
            {fieldErrors.name && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="teacher-email" className="erp-label erp-label-required">
              Email Address
            </label>
            <input
              id="teacher-email"
              type="email"
              placeholder="e.g. priya.patel@college.edu"
              value={emailId}
              onChange={(e) => {
                setEmailId(e.target.value);
                if (fieldErrors.emailId) setFieldErrors((prev) => ({ ...prev, emailId: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.emailId ? "#ef4444" : undefined }}
            />
            {fieldErrors.emailId && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.emailId}
              </span>
            )}
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="teacher-phone" className="erp-label erp-label-required">
              Mobile Contact
            </label>
            <input
              id="teacher-phone"
              type="tel"
              placeholder="e.g. +91 91234 56789"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.phone ? "#ef4444" : undefined }}
            />
            {fieldErrors.phone && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.phone}
              </span>
            )}
          </div>

          {/* Department / Subject */}
          <div>
            <label htmlFor="teacher-subject" className="erp-label erp-label-required">
              Department / Subject Specialization
            </label>
            <input
              id="teacher-subject"
              type="text"
              placeholder="e.g. Data Structures & Algorithms"
              value={assignedSubject}
              onChange={(e) => {
                setAssignedSubject(e.target.value);
                if (fieldErrors.assignedSubject) setFieldErrors((prev) => ({ ...prev, assignedSubject: "" }));
              }}
              className="erp-input"
              style={{ borderColor: fieldErrors.assignedSubject ? "#ef4444" : undefined }}
            />
            {fieldErrors.assignedSubject && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.assignedSubject}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editTeacher && (
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
              : editTeacher
              ? "Update Faculty Record"
              : "Register Faculty Member"}
          </button>
        </div>
      </form>
    </div>
  );
}