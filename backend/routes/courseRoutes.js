
const express = require("express");
const router = express.Router();

const Course = require("../models/Course");
const { protect, authorize } = require("../middleware/authMiddleware");

// Get all courses - public
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one course - public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(400).json({ message: "Invalid course ID" });
  }
});

// Create course - instructor or admin
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.create({
        ...req.body,
        instructor: req.user._id,
      });

      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update course - its instructor or admin
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role !== "admin" &&
        String(course.instructor) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can only update your own courses",
        });
      }

      const allowedFields = ["title", "description", "price", "category"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          course.set(field, req.body[field]);
        }
      });

      await course.save();
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete course - its instructor or admin
router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role !== "admin" &&
        String(course.instructor) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can only delete your own courses",
        });
      }

      await course.deleteOne();
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;

