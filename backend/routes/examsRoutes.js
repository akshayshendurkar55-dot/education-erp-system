const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 1. Get All Exams
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM exams ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Exams Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Add Exam
router.post("/", async (req, res) => {
  try {
    const { exam_name, course_name, exam_date, total_marks } = req.body;

    const result = await pool.query(
      `INSERT INTO exams
      (exam_name, course_name, exam_date, total_marks)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [exam_name, course_name, exam_date, total_marks]
    );

    res.status(201).json({
      message: "Exam Added Successfully",
      exam: result.rows[0],
    });

  } catch (err) {
    console.error("Add Exam Error:", err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// 3. Update Exam
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      exam_name,
      course_name,
      exam_date,
      total_marks,
    } = req.body;

    const result = await pool.query(
      `UPDATE exams
       SET exam_name=$1,
           course_name=$2,
           exam_date=$3,
           total_marks=$4
       WHERE id=$5
       RETURNING *`,
      [
        exam_name,
        course_name,
        exam_date,
        total_marks,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Exam Not Found",
      });
    }

    res.json({
      message: "Exam Updated Successfully",
      exam: result.rows[0],
    });

  } catch (err) {
    console.error("Update Exam DB Error:", err);

    res.status(500).json({
      message: "Server Error: " + err.message,
    });
  }
});

// 4. Delete Exam
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM exams WHERE id=$1",
      [req.params.id]
    );

    res.json({
      message: "Exam Deleted Successfully",
    });

  } catch (err) {
    console.error("Delete Exam Error:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;