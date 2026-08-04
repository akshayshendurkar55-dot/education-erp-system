const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername } = require("../models/userModel");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check username
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        message: "Invalid Username",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    // Check role
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    // Generate Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
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
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  login,
};