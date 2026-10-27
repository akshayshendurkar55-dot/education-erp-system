const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// Require authentication for dashboard metrics
router.use(authenticateToken);

// Fast aggregate summary metrics route for dashboard
router.get("/", async (req, res) => {
  try {
    const [students, teachers, courses, exams, feesCollected, feesPending] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students"),
      pool.query("SELECT COUNT(*) FROM teachers"),
      pool.query("SELECT COUNT(*) FROM courses"),
      pool.query("SELECT COUNT(*) FROM exams"),
      pool.query("SELECT COALESCE(SUM(paid_amount), 0) AS total FROM fees"),
      pool.query("SELECT COALESCE(SUM(remaining_amount), 0) AS pending FROM fees"),
    ]);

    res.json({
      students: Number(students.rows[0].count) || 0,
      teachers: Number(teachers.rows[0].count) || 0,
      courses: Number(courses.rows[0].count) || 0,
      exams: Number(exams.rows[0].count) || 0,
      fees: Number(feesCollected.rows[0].total) || 0,
      pendingFees: Number(feesPending.rows[0].pending) || 0,
    });
  } catch (err) {
    console.error("Dashboard aggregation query error:", err.message);
    res.status(500).json({ message: "Failed to load dashboard metrics. Please try again later." });
  }
});

module.exports = router;