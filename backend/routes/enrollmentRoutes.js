


const express = require("express");
const router = express.Router();

const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/authMiddleware");

// Enroll in a course
router.post("/enroll", protect, authorize("student"), async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existing) {
      return res.status(409).json({
        message: "Already enrolled in this course",
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    return res.status(201).json({
      message: "Enrollment successful",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already enrolled in this course",
      });
    }

    return res.status(500).json({
      message: "Unable to enroll in course",
    });
  }
});

// Get logged-in student's courses
router.get("/my-courses", protect, authorize("student"), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    }).populate("course");

    return res.status(200).json(enrollments);
  } catch (error) {
    console.error("My courses error:", error);
    return res.status(500).json({
      message: "Unable to fetch enrolled courses",
    });
  }
});

module.exports = router;
