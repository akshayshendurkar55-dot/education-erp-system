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

// Test Route
app.get("/", (req, res) => {
  res.send("Education ERP Backend is Running...");
});

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
pool.connect()
  .then(() => {
    console.log("PostgreSQL Connected Successfully");
  })
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});