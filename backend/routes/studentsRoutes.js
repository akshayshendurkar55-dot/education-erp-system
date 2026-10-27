const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for all student routes
router.use(authenticateToken);

// 1. Get all registered students
router.get("/", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM students ORDER BY id ASC");
    res.json(data.rows);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ message: "Failed to fetch students. Please try again later." });
  }
});

// 2. Add new student
router.post("/", async (req, res) => {
  try {
    const { fullName, email, mobile, course } = req.body;

    // Validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Full Name is required." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "A valid Email address is required." });
    }
    if (!mobile || typeof mobile !== "string" || mobile.trim().length < 7) {
      return res.status(400).json({ message: "A valid Mobile number is required." });
    }
    if (!course || typeof course !== "string" || !course.trim()) {
      return res.status(400).json({ message: "Course selection is required." });
    }

    const query = `
      INSERT INTO students (full_name, email, mobile, course)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      fullName.trim(),
      email.trim().toLowerCase(),
      mobile.trim(),
      course.trim(),
    ]);

    res.status(201).json({
      message: "Student Added Successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding student:", err.message);
    res.status(500).json({ message: "Failed to add student. Please try again later." });
  }
});

// 3. Update student record
router.put("/:id", async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const { fullName, email, mobile, course } = req.body;

    // Validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ message: "Full Name is required." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "A valid Email address is required." });
    }
    if (!mobile || typeof mobile !== "string" || mobile.trim().length < 7) {
      return res.status(400).json({ message: "A valid Mobile number is required." });
    }
    if (!course || typeof course !== "string" || !course.trim()) {
      return res.status(400).json({ message: "Course selection is required." });
    }

    const result = await pool.query(
      `UPDATE students
       SET full_name = $1, email = $2, mobile = $3, course = $4
       WHERE id = $5
       RETURNING *`,
      [
        fullName.trim(),
        email.trim().toLowerCase(),
        mobile.trim(),
        course.trim(),
        studentId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student Not Found" });
    }

    res.json({
      message: "Student Updated Successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating student:", err.message);
    res.status(500).json({ message: "Failed to update student. Please try again later." });
  }
});

// 4. Delete student
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student Not Found" });
    }

    res.json({ message: "Student Deleted Successfully" });
  } catch (err) {
    console.error("Error deleting student:", err.message);
    res.status(500).json({ message: "Failed to delete student. Please try again later." });
  }
});

module.exports = router;