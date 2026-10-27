const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for all teacher routes
router.use(authenticateToken);

// 1. Fetch Teachers List
router.get("/", async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM teachers ORDER BY id ASC");
    res.json(response.rows);
  } catch (err) {
    console.error("Get Teachers Error:", err.message);
    res.status(500).json({ message: "Failed to fetch teachers. Please try again later." });
  }
});

// 2. Add New Teacher Record
router.post("/", async (req, res) => {
  try {
    const { fullName, email, mobile, subject } = req.body;

    // Validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Teacher Name is required." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "A valid Email address is required." });
    }
    if (!mobile || typeof mobile !== "string" || mobile.trim().length < 7) {
      return res.status(400).json({ message: "A valid Mobile number is required." });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ message: "Subject / Department is required." });
    }

    const resDb = await pool.query(
      "INSERT INTO teachers (full_name, email, mobile, subject) VALUES ($1, $2, $3, $4) RETURNING *",
      [fullName.trim(), email.trim().toLowerCase(), mobile.trim(), subject.trim()]
    );

    res.status(201).json({
      message: "Teacher Added Successfully",
      teacher: resDb.rows[0],
    });
  } catch (err) {
    console.error("Add Teacher Error:", err.message);
    res.status(500).json({ message: "Failed to add teacher. Please try again later." });
  }
});

// 3. Update Existing Teacher
router.put("/:id", async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id, 10);
    if (isNaN(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID." });
    }

    const { fullName, email, mobile, subject } = req.body;

    // Validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Teacher Name is required." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "A valid Email address is required." });
    }
    if (!mobile || typeof mobile !== "string" || mobile.trim().length < 7) {
      return res.status(400).json({ message: "A valid Mobile number is required." });
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ message: "Subject / Department is required." });
    }

    const updateQuery = `
      UPDATE teachers
      SET full_name = $1, email = $2, mobile = $3, subject = $4
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      fullName.trim(),
      email.trim().toLowerCase(),
      mobile.trim(),
      subject.trim(),
      teacherId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Teacher Not Found" });
    }

    res.json({
      message: "Teacher Updated Successfully",
      teacher: result.rows[0],
    });
  } catch (err) {
    console.error("Update Teacher Error:", err.message);
    res.status(500).json({ message: "Failed to update teacher. Please try again later." });
  }
});

// 4. Remove Teacher
router.delete("/:id", async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id, 10);
    if (isNaN(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID." });
    }

    const deletedRecord = await pool.query("DELETE FROM teachers WHERE id = $1 RETURNING *", [teacherId]);

    if (deletedRecord.rows.length === 0) {
      return res.status(404).json({ message: "Teacher Not Found" });
    }

    res.json({ message: "Teacher Deleted Successfully" });
  } catch (err) {
    console.error("Delete Teacher Error:", err.message);
    res.status(500).json({ message: "Failed to delete teacher. Please try again later." });
  }
});

module.exports = router;