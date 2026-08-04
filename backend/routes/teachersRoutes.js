const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// =============================
// Get All Teachers
// =============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM teachers ORDER BY id ASC"
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
// Add Teacher
// =============================
router.post("/", async (req, res) => {
  try {
    const { fullName, email, mobile, subject } = req.body;

    const result = await pool.query(
      `INSERT INTO teachers
      (full_name,email,mobile,subject)
      VALUES($1,$2,$3,$4)
      RETURNING *`,
      [fullName, email, mobile, subject]
    );

    res.status(201).json({
      message: "Teacher Added Successfully",
      teacher: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
// =============================
// Update Teacher
// =============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobile, subject } = req.body;

    const result = await pool.query(
      `UPDATE teachers
       SET full_name=$1,
           email=$2,
           mobile=$3,
           subject=$4
       WHERE id=$5
       RETURNING *`,
      [fullName, email, mobile, subject, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Teacher Not Found",
      });
    }

    res.json({
      message: "Teacher Updated Successfully",
      teacher: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =============================
// Delete Teacher
// =============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM teachers WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Teacher Not Found",
      });
    }

    res.json({
      message: "Teacher Deleted Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    }); 
  }
});
module.exports = router;