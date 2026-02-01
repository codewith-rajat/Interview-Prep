const express = require("express");
const router = express.Router();
const {
    createSlot,
    getAvailableSlots,
    bookSlot,
} = require("../controllers/interviewController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/slots", protect, authorizeRoles("interviewer"), createSlot);
router.get("/slots/available", protect, getAvailableSlots);
router.post("/slots/:id/book", protect, authorizeRoles("interviewee"), bookSlot);
