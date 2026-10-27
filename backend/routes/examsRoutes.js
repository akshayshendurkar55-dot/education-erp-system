const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for all exam routes
router.use(authenticateToken);

// 1. Get All Exams
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exams ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get Exams Error:", err.message);
    res.status(500).json({ message: "Failed to fetch exams. Please try again later." });
  }
});

// 2. Add Exam
router.post("/", async (req, res) => {
  try {
    const { exam_name, course_name, exam_date, total_marks } = req.body;

    // Validation
    if (!exam_name || typeof exam_name !== "string" || !exam_name.trim()) {
      return res.status(400).json({ message: "Exam Name is required." });
    }
    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return res.status(400).json({ message: "Course Name is required." });
    }
    if (!exam_date || isNaN(Date.parse(exam_date))) {
      return res.status(400).json({ message: "A valid Exam Date (YYYY-MM-DD) is required." });
    }

    const marks = parseInt(total_marks, 10);
    if (isNaN(marks) || marks <= 0) {
      return res.status(400).json({ message: "Total Marks must be a positive integer." });
    }

    const result = await pool.query(
      `INSERT INTO exams
      (exam_name, course_name, exam_date, total_marks)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [exam_name.trim(), course_name.trim(), exam_date, marks]
    );

    res.status(201).json({
      message: "Exam Added Successfully",
      exam: result.rows[0],
    });
  } catch (err) {
    console.error("Add Exam Error:", err.message);
    res.status(500).json({ message: "Failed to add exam. Please try again later." });
  }
});

// 3. Update Exam
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid exam ID." });
    }

    const { exam_name, course_name, exam_date, total_marks } = req.body;

    // Validation
    if (!exam_name || typeof exam_name !== "string" || !exam_name.trim()) {
      return res.status(400).json({ message: "Exam Name is required." });
    }
    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return res.status(400).json({ message: "Course Name is required." });
    }
    if (!exam_date || isNaN(Date.parse(exam_date))) {
      return res.status(400).json({ message: "A valid Exam Date (YYYY-MM-DD) is required." });
    }

    const marks = parseInt(total_marks, 10);
    if (isNaN(marks) || marks <= 0) {
      return res.status(400).json({ message: "Total Marks must be a positive integer." });
    }

    const result = await pool.query(
      `UPDATE exams
       SET exam_name = $1,
           course_name = $2,
           exam_date = $3,
           total_marks = $4
       WHERE id = $5
       RETURNING *`,
      [exam_name.trim(), course_name.trim(), exam_date, marks, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exam Not Found" });
    }

    res.json({
      message: "Exam Updated Successfully",
      exam: result.rows[0],
    });
  } catch (err) {
    console.error("Update Exam DB Error:", err.message);
    res.status(500).json({ message: "Failed to update exam. Please try again later." });
  }
});

// 4. Delete Exam
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid exam ID." });
    }

    const result = await pool.query("DELETE FROM exams WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exam Not Found" });
    }

    res.json({ message: "Exam Deleted Successfully" });
  } catch (err) {
    console.error("Delete Exam Error:", err.message);
    res.status(500).json({ message: "Failed to delete exam. Please try again later." });
  }
});

module.exports = router;