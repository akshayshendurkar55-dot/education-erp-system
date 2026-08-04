const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");
const bcrypt = require("bcrypt");

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Direct plain text match ('admin123' === 'admin123')
    let isMatch = (password === user.password);

    if (!isMatch && user.password && user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    res.json({
      message: "Login successful",
      token: "dummy-jwt-token-12345",
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;