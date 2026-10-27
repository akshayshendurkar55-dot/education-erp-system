const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername } = require("../models/userModel");

// Admin Login Controller Logic
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required." });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ message: "Password is required." });
    }

    const trimmedUsername = username.trim();

    // Check if user exists first
    const user = await findUserByUsername(trimmedUsername);
    if (!user) {
      return res.status(401).json({ message: "Invalid Username or Password." });
    }

    // Password check (plain text or bcrypt hash)
    let isMatch = password === user.password;
    if (!isMatch && user.password && user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Username or Password." });
    }

    // Role check - Admin access verification
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access Denied: Admin role required." });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("Security Configuration Error: JWT_SECRET environment variable is not defined.");
      return res.status(500).json({
        message: "Server Configuration Error: Authentication secret is not configured.",
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secretKey,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Auth Controller Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Current Logged-in User Profile verification
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Auth getMe Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  login,
  getMe,
};