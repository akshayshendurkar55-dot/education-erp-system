const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Login Route - public
router.post("/login", authController.login);

// Current User Profile Verification - protected
router.get("/me", authenticateToken, authController.getMe);

module.exports = router;