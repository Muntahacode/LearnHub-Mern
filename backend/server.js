

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to LearnHub LMS API!");
});

// API test
app.get("/api/test", (req, res) => {
  res.send("API is working!");
});

// Load routes
console.log("courseRoutes:", typeof courseRoutes);
console.log("authRoutes:", typeof authRoutes);
console.log("enrollmentRoutes:", typeof enrollmentRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", enrollmentRoutes);

app.post("/api/enroll", require("./middleware/authMiddleware").protect, require("./middleware/authMiddleware").authorize("student"), async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const Course = require("./models/Course");
    const Enrollment = require("./models/Enrollment");

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existing) {
      return res.status(409).json({ message: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Unable to enroll in course" });
  }
});


// Not found handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`LearnHub server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();
