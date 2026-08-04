const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get All Fees
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM fees ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add Fee (POST)
router.post("/", async (req, res) => {
  try {
    const {
      student_name,
      roll_no,
      course_name,
      total_fees,
      paid_amount,
      remaining_amount,
      payment_date,
      payment_mode,
      status,
    } = req.body;

    const todayDate = payment_date || new Date().toISOString().split("T")[0];
    const mode = payment_mode || "Online";

    const result = await pool.query(
      `INSERT INTO fees
      (student_name, roll_no, course_name, total_fees, paid_amount, remaining_amount, payment_date, payment_mode, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        student_name,
        roll_no,
        course_name,
        total_fees,
        paid_amount,
        remaining_amount,
        todayDate,
        mode,
        status,
      ]
    );

    res.status(201).json({
      message: "Fee Added Successfully",
      fee: result.rows[0],
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Update Fee / Installment Pay (PUT) -> ISKI WAJAH SE ERROR AA RAHA THA!
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paid_amount,
      remaining_amount,
      payment_date,
      payment_mode,
      status,
    } = req.body;

    const todayDate = payment_date || new Date().toISOString().split("T")[0];
    const mode = payment_mode || "Online";

    const result = await pool.query(
      `UPDATE fees 
       SET paid_amount = $1, remaining_amount = $2, payment_date = $3, payment_mode = $4, status = $5 
       WHERE id = $6 
       RETURNING *`,
      [paid_amount, remaining_amount, todayDate, mode, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Fee Updated Successfully",
      fee: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;