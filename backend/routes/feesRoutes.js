const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for all fees routes
router.use(authenticateToken);

// 1. Get All Fees
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM fees ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get Fees Error:", err.message);
    res.status(500).json({ message: "Failed to fetch fee records. Please try again later." });
  }
});

// 2. Add Fee Record
router.post("/", async (req, res) => {
  try {
    const {
      student_name,
      roll_no,
      course_name,
      total_fees,
      paid_amount,
      remaining_amount,
      payment_date,
      payment_mode,
      status,
    } = req.body;

    // Validation
    if (!student_name || typeof student_name !== "string" || !student_name.trim()) {
      return res.status(400).json({ message: "Student Name is required." });
    }
    if (!roll_no || typeof roll_no !== "string" || !roll_no.trim()) {
      return res.status(400).json({ message: "Roll Number / Student ID is required." });
    }
    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return res.status(400).json({ message: "Course Name is required." });
    }

    const total = parseFloat(total_fees);
    const paid = parseFloat(paid_amount);
    if (isNaN(total) || total < 0 || isNaN(paid) || paid < 0) {
      return res.status(400).json({ message: "Total Fees and Paid Amount must be valid non-negative numbers." });
    }

    const computedRemaining = remaining_amount !== undefined && remaining_amount !== null && remaining_amount !== ""
      ? parseFloat(remaining_amount)
      : Math.max(0, total - paid);

    const todayDate = payment_date && !isNaN(Date.parse(payment_date))
      ? payment_date
      : new Date().toISOString().split("T")[0];

    const mode = (payment_mode || "Online").trim();
    const feeStatus = (status || (computedRemaining <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending")).trim();

    const result = await pool.query(
      `INSERT INTO fees
      (student_name, roll_no, course_name, total_fees, paid_amount, remaining_amount, payment_date, payment_mode, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        student_name.trim(),
        roll_no.trim(),
        course_name.trim(),
        total,
        paid,
        computedRemaining,
        todayDate,
        mode,
        feeStatus,
      ]
    );

    res.status(201).json({
      message: "Fee Added Successfully",
      fee: result.rows[0],
    });
  } catch (err) {
    console.error("Add Fee Error:", err.message);
    res.status(500).json({ message: "Failed to add fee record. Please try again later." });
  }
});

// 3. Update Fee / Installment Payment (PUT)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fee record ID." });
    }

    const {
      paid_amount,
      remaining_amount,
      payment_date,
      payment_mode,
      status,
    } = req.body;

    const paid = parseFloat(paid_amount);
    const remaining = parseFloat(remaining_amount);

    if (isNaN(paid) || paid < 0 || isNaN(remaining) || remaining < 0) {
      return res.status(400).json({ message: "Paid amount and remaining amount must be valid non-negative numbers." });
    }

    const todayDate = payment_date && !isNaN(Date.parse(payment_date))
      ? payment_date
      : new Date().toISOString().split("T")[0];

    const mode = (payment_mode || "Online").trim();
    const feeStatus = (status || (remaining <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending")).trim();

    const result = await pool.query(
      `UPDATE fees 
       SET paid_amount = $1, remaining_amount = $2, payment_date = $3, payment_mode = $4, status = $5 
       WHERE id = $6 
       RETURNING *`,
      [paid, remaining, todayDate, mode, feeStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Fee Updated Successfully",
      fee: result.rows[0],
    });
  } catch (err) {
    console.error("Update Fee Error:", err.message);
    res.status(500).json({ message: "Failed to update fee record. Please try again later." });
  }
});

// 4. Delete Fee Record (DELETE - Implemented)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid fee record ID." });
    }

    const result = await pool.query("DELETE FROM fees WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fee Record Not Found" });
    }

    res.json({ message: "Fee Record Deleted Successfully" });
  } catch (err) {
    console.error("Delete Fee Error:", err.message);
    res.status(500).json({ message: "Failed to delete fee record. Please try again later." });
  }
});

module.exports = router;