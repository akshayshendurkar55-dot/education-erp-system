const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 1. Get All Courses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM courses ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Add Course
router.post("/", async (req, res) => {
  try {
    // Handling both camelCase and snake_case safely
    const course_name = req.body.course_name || req.body.courseName;
    const course_code = req.body.course_code || req.body.courseCode;
    const { duration, fees } = req.body;

    const result = await pool.query(
      `INSERT INTO courses
      (course_name, course_code, duration, fees)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [course_name, course_code, duration, fees]
    );

    res.status(201).json({
      message: "Course Added Successfully",
      course: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 3. Update Course
router.put("/:id", async (req, res) => {
  console.log("ID:", req.params.id);
console.log("BODY:", req.body);
  try {
    const { id } = req.params;
    // Dono naming formats handle kiye hain taaki kabhie error na aaye
    const course_name = req.body.course_name || req.body.courseName;
    const course_code = req.body.course_code || req.body.courseCode;
    const { duration, fees } = req.body;

    const result = await pool.query(
      `UPDATE courses
       SET course_name = $1,
           course_code = $2,
           duration = $3,
           fees = $4
       WHERE id = $5
       RETURNING *`,
      [course_name, course_code, duration, fees, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      message: "Course Updated Successfully",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Database Update Error:", err);
    res.status(500).json({
      message: "Server Error while updating course",
    });
  }
});

// 4. Delete Course
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM courses WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Course Deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;