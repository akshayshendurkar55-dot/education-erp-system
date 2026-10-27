const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db.js");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const studentsRoutes = require("./routes/studentsRoutes");
const teachersRoutes = require("./routes/teachersRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const examsRoutes = require("./routes/examsRoutes");
const feesRoutes = require("./routes/feesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Setup
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Education ERP Backend API",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// Global Error Handler (sanitizes internal errors)
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
});

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
pool.connect()
  .then(() => {
    console.log("PostgreSQL Connected Successfully");
  })
  .catch((err) => {
    console.error("Database Connection Error:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});