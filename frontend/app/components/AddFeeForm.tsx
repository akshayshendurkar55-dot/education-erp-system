"use client";

import React, { useState } from "react";
import { apiFetch, FeeRecord } from "../../lib/api";
import { useUI } from "../../lib/UIContext";
import { CheckIcon, CloseIcon } from "./Icons";

interface AddFeeFormProps {
  onFeeAdded: () => void;
  editFee?: FeeRecord | null;
  setEditFee?: (fee: FeeRecord | null) => void;
}

function getInitialPaymentDate(editFee?: FeeRecord | null): string {
  if (editFee?.payment_date) {
    const d = editFee.payment_date;
    if (d.includes("T")) return d.split("T")[0];
    if (d.length > 10) return d.substring(0, 10);
    return d;
  }
  return new Date().toISOString().split("T")[0];
}

export default function AddFeeForm({ onFeeAdded, editFee, setEditFee }: AddFeeFormProps) {
  const { showToast } = useUI();
  const [studentName, setStudentName] = useState(editFee?.student_name || "");
  const [rollNo, setRollNo] = useState(editFee?.roll_no || "");
  const [courseName, setCourseName] = useState(editFee?.course_name || "");
  const [totalFees, setTotalFees] = useState(editFee?.total_fees?.toString() || "");
  const [paidAmount, setPaidAmount] = useState(editFee?.paid_amount?.toString() || "");
  const [newPayment, setNewPayment] = useState("");
  const [paymentMode, setPaymentMode] = useState(editFee?.payment_mode || "Online");
  const [paymentDate, setPaymentDate] = useState(getInitialPaymentDate(editFee));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [prevEditFee, setPrevEditFee] = useState(editFee);
  if (editFee !== prevEditFee) {
    setPrevEditFee(editFee);
    setStudentName(editFee?.student_name || "");
    setRollNo(editFee?.roll_no || "");
    setCourseName(editFee?.course_name || "");
    setTotalFees(editFee?.total_fees?.toString() || "");
    setPaidAmount(editFee?.paid_amount?.toString() || "");
    setPaymentMode(editFee?.payment_mode || "Online");
    setPaymentDate(getInitialPaymentDate(editFee));
    setNewPayment("");
    setFieldErrors({});
  }

  const resetForm = () => {
    setStudentName("");
    setRollNo("");
    setCourseName("");
    setTotalFees("");
    setPaidAmount("");
    setNewPayment("");
    setPaymentMode("Online");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setFieldErrors({});
    if (setEditFee) setEditFee(null);
  };

  const total = parseFloat(totalFees) || 0;
  const currentPaid = parseFloat(paidAmount) || 0;
  const addedInstallment = parseFloat(newPayment) || 0;
  const finalPaid = editFee ? currentPaid + addedInstallment : currentPaid;
  const remaining = Math.max(0, total - finalPaid);

  let calculatedStatus = "Pending";
  if (finalPaid >= total && total > 0) {
    calculatedStatus = "Paid";
  } else if (finalPaid > 0) {
    calculatedStatus = "Partial";
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!studentName.trim()) errors.studentName = "Student Name is required.";
    if (!rollNo.trim()) errors.rollNo = "Roll Number / Student ID is required.";
    if (!courseName.trim()) errors.courseName = "Course Name is required.";
    if (isNaN(total) || total <= 0) errors.totalFees = "Total Fees must be a valid positive amount.";
    if (!editFee && (isNaN(currentPaid) || currentPaid < 0)) errors.paidAmount = "Initial Paid Amount must be non-negative.";
    if (editFee && addedInstallment < 0) errors.newPayment = "Installment payment cannot be negative.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    const recordId = editFee?.id;
    if (editFee && !recordId) {
      showToast("Error: Missing Fee Record ID.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        student_name: studentName.trim(),
        roll_no: rollNo.trim(),
        course_name: courseName.trim(),
        total_fees: total,
        paid_amount: finalPaid,
        remaining_amount: remaining,
        payment_date: paymentDate || new Date().toISOString().split("T")[0],
        payment_mode: paymentMode,
        status: calculatedStatus,
      };

      const targetUrl = editFee
        ? `/fees/${recordId}`
        : "/fees";

      const { ok, data, message } = await apiFetch(targetUrl, {
        method: editFee ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        showToast(
          editFee
            ? `Installment recorded successfully! Status: ${calculatedStatus}`
            : "Fee record registered successfully!",
          "success"
        );
        resetForm();
        onFeeAdded();
      } else {
        showToast(message || data?.message || "Failed to save fee record.", "error");
      }
    } catch (err: unknown) {
      console.error("Fee submit error:", err);
      showToast("Server connection failure while recording fee.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="erp-card" style={{ padding: "20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            {editFee ? "Record Installment / Edit Fee Account" : "Record New Student Fee Payment"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
            {editFee
              ? `Processing payment for ${studentName} (Roll #${rollNo})`
              : "Register total academic tuition obligation and initialize payment record"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className={`erp-badge ${
              calculatedStatus === "Paid"
                ? "erp-badge-success"
                : calculatedStatus === "Partial"
                ? "erp-badge-warning"
                : "erp-badge-danger"
            }`}
          >
            Preview: {calculatedStatus}
          </span>
          {editFee && <span className="erp-badge erp-badge-info">Installment Mode</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Student Name */}
          <div>
            <label htmlFor="fee-student-name" className="erp-label erp-label-required">
              Student Name
            </label>
            <input
              id="fee-student-name"
              type="text"
              placeholder="e.g. Ananya Sen"
              value={studentName}
              disabled={Boolean(editFee)}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (fieldErrors.studentName) setFieldErrors((prev) => ({ ...prev, studentName: "" }));
              }}
              className="erp-input"
              style={{
                borderColor: fieldErrors.studentName ? "#ef4444" : undefined,
                backgroundColor: editFee ? "#f8fafc" : "#ffffff",
              }}
            />
            {fieldErrors.studentName && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.studentName}
              </span>
            )}
          </div>

          {/* Roll No */}
          <div>
            <label htmlFor="fee-roll-no" className="erp-label erp-label-required">
              Roll No / Student ID
            </label>
            <input
              id="fee-roll-no"
              type="text"
              placeholder="e.g. CS2026-042"
              value={rollNo}
              disabled={Boolean(editFee)}
              onChange={(e) => {
                setRollNo(e.target.value);
                if (fieldErrors.rollNo) setFieldErrors((prev) => ({ ...prev, rollNo: "" }));
              }}
              className="erp-input"
              style={{
                borderColor: fieldErrors.rollNo ? "#ef4444" : undefined,
                backgroundColor: editFee ? "#f8fafc" : "#ffffff",
              }}
            />
            {fieldErrors.rollNo && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.rollNo}
              </span>
            )}
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="fee-course-name" className="erp-label erp-label-required">
              Enrolled Course
            </label>
            <input
              id="fee-course-name"
              type="text"
              placeholder="e.g. B.Tech Computer Science"
              value={courseName}
              disabled={Boolean(editFee)}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (fieldErrors.courseName) setFieldErrors((prev) => ({ ...prev, courseName: "" }));
              }}
              className="erp-input"
              style={{
                borderColor: fieldErrors.courseName ? "#ef4444" : undefined,
                backgroundColor: editFee ? "#f8fafc" : "#ffffff",
              }}
            />
            {fieldErrors.courseName && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.courseName}
              </span>
            )}
          </div>

          {/* Total Fees */}
          <div>
            <label htmlFor="fee-total-amount" className="erp-label erp-label-required">
              Total Invoiced Fees (₹)
            </label>
            <input
              id="fee-total-amount"
              type="number"
              min="0"
              placeholder="e.g. 80000"
              value={totalFees}
              disabled={Boolean(editFee)}
              onChange={(e) => {
                setTotalFees(e.target.value);
                if (fieldErrors.totalFees) setFieldErrors((prev) => ({ ...prev, totalFees: "" }));
              }}
              className="erp-input"
              style={{
                borderColor: fieldErrors.totalFees ? "#ef4444" : undefined,
                backgroundColor: editFee ? "#f8fafc" : "#ffffff",
              }}
            />
            {fieldErrors.totalFees && (
              <span style={{ fontSize: "12px", color: "#dc2626", display: "block", marginTop: "4px" }}>
                {fieldErrors.totalFees}
              </span>
            )}
          </div>

          {/* Paid / New Payment */}
          {!editFee ? (
            <div>
              <label htmlFor="fee-paid-amount" className="erp-label erp-label-required">
                Initial Paid Amount (₹)
              </label>
              <input
                id="fee-paid-amount"
                type="number"
                min="0"
                placeholder="e.g. 40000"
                value={paidAmount}
                onChange={(e) => {
                  setPaidAmount(e.target.value);
                  if (fieldErrors.paidAmount) setFieldErrors((prev) => ({ ...prev, paidAmount: "" }));
                }}
                className="erp-input"
                style={{ borderColor: fieldErrors.paidAmount ? "#ef4444" : undefined }}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="fee-new-installment" className="erp-label erp-label-required">
                Add New Installment Payment (₹)
              </label>
              <input
                id="fee-new-installment"
                type="number"
                min="0"
                placeholder="Enter additional payment"
                value={newPayment}
                onChange={(e) => {
                  setNewPayment(e.target.value);
                  if (fieldErrors.newPayment) setFieldErrors((prev) => ({ ...prev, newPayment: "" }));
                }}
                className="erp-input"
                style={{ borderColor: "#16a34a" }}
              />
              <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                Previously Paid: ₹ {currentPaid.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label htmlFor="fee-payment-mode" className="erp-label erp-label-required">
              Payment Instrument / Mode
            </label>
            <select
              id="fee-payment-mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="erp-input"
            >
              <option value="Online">Online / UPI / NetBanking</option>
              <option value="Cash">Cash Receipt</option>
              <option value="Cheque / DD">Cheque / Demand Draft</option>
              <option value="Bank Transfer">NEFT / RTGS</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="fee-payment-date" className="erp-label erp-label-required">
              Transaction Date
            </label>
            <input
              id="fee-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="erp-input"
            />
          </div>
        </div>

        {/* Real-time Balance Calculation Strip */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Total Invoiced
              </span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
                ₹ {total.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Cumulative Paid
              </span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#16a34a" }}>
                ₹ {finalPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Remaining Balance
              </span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: remaining > 0 ? "#dc2626" : "#16a34a" }}>
                ₹ {remaining.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {editFee && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={resetForm}
                className="erp-btn erp-btn-outline"
              >
                <CloseIcon size={16} /> Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="erp-btn erp-btn-primary"
            >
              <CheckIcon size={16} />
              {isSubmitting
                ? "Recording..."
                : editFee
                ? "Update / Add Installment"
                : "Submit Fee Record"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}