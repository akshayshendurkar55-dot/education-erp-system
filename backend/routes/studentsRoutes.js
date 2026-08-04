const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// =============================
// Get All Students
// =============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM students ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =============================
// Add Student
// =============================
router.post("/", async (req, res) => {
  try {
    const { fullName, email, mobile, course } = req.body;

    const result = await pool.query(
      `INSERT INTO students
      (full_name,email,mobile,course)
      VALUES($1,$2,$3,$4)
      RETURNING *`,
      [fullName, email, mobile, course]
    );

    res.status(201).json({
      message: "Student Added Successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =============================
// Update Student
// =============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobile, course } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET full_name=$1,
           email=$2,
           mobile=$3,
           course=$4
       WHERE id=$5
       RETURNING *`,
      [fullName, email, mobile, course, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student Not Found",
      });
    }

    res.json({
      message: "Student Updated Successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =============================
// Delete Student
// =============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM students WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student Not Found",
      });
    }

    res.json({
      message: "Student Deleted Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;