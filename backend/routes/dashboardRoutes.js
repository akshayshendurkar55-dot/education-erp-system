const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM students");
    const teachers = await pool.query("SELECT COUNT(*) FROM teachers");
    const courses = await pool.query("SELECT COUNT(*) FROM courses");
    const exams = await pool.query("SELECT COUNT(*) FROM exams");

    const fees = await pool.query(
      "SELECT COALESCE(SUM(paid_amount),0) AS total FROM fees"
    );

    res.json({
      students: students.rows[0].count,
      teachers: teachers.rows[0].count,
      courses: courses.rows[0].count,
      exams: exams.rows[0].count,
      fees: fees.rows[0].total,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;