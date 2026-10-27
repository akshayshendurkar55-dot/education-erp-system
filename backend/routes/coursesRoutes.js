const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for all course routes
router.use(authenticateToken);

// 1. Get All Courses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get Courses Error:", err.message);
    res.status(500).json({ message: "Failed to fetch courses. Please try again later." });
  }
});

// 2. Add Course
router.post("/", async (req, res) => {
  try {
    const course_name = req.body.course_name || req.body.courseName;
    const course_code = req.body.course_code || req.body.courseCode;
    const { duration, fees } = req.body;

    // Validation
    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return res.status(400).json({ message: "Course Name is required." });
    }
    if (!course_code || typeof course_code !== "string" || !course_code.trim()) {
      return res.status(400).json({ message: "Course Code is required." });
    }

    const parsedFees = fees !== undefined && fees !== null && fees !== "" ? parseFloat(fees) : 0;
    if (isNaN(parsedFees) || parsedFees < 0) {
      return res.status(400).json({ message: "Fees must be a valid non-negative number." });
    }

    const result = await pool.query(
      `INSERT INTO courses
      (course_name, course_code, duration, fees)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [course_name.trim(), course_code.trim().toUpperCase(), (duration || "").trim(), parsedFees]
    );

    res.status(201).json({
      message: "Course Added Successfully",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Add Course Error:", err.message);
    res.status(500).json({ message: "Failed to add course. Please try again later." });
  }
});

// 3. Update Course
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const course_name = req.body.course_name || req.body.courseName;
    const course_code = req.body.course_code || req.body.courseCode;
    const { duration, fees } = req.body;

    // Validation
    if (!course_name || typeof course_name !== "string" || !course_name.trim()) {
      return res.status(400).json({ message: "Course Name is required." });
    }
    if (!course_code || typeof course_code !== "string" || !course_code.trim()) {
      return res.status(400).json({ message: "Course Code is required." });
    }

    const parsedFees = fees !== undefined && fees !== null && fees !== "" ? parseFloat(fees) : 0;
    if (isNaN(parsedFees) || parsedFees < 0) {
      return res.status(400).json({ message: "Fees must be a valid non-negative number." });
    }

    const result = await pool.query(
      `UPDATE courses
       SET course_name = $1,
           course_code = $2,
           duration = $3,
           fees = $4
       WHERE id = $5
       RETURNING *`,
      [course_name.trim(), course_code.trim().toUpperCase(), (duration || "").trim(), parsedFees, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course Updated Successfully",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Update Course Error:", err.message);
    res.status(500).json({ message: "Failed to update course. Please try again later." });
  }
});

// 4. Delete Course
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course Deleted Successfully" });
  } catch (err) {
    console.error("Delete Course Error:", err.message);
    res.status(500).json({ message: "Failed to delete course. Please try again later." });
  }
});

module.exports = router;