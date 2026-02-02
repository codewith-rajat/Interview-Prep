const express = require("express");
const router = express.Router();    
const{
    giveFeedback,
    getMyFeedbacks,
    getSingleFeedback
} = require("../controllers/feedbackController");

const {protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/",
    protect,
    authorizeRoles("interviewer"),
    giveFeedback
);

router.get("/me", 
    protect, 
    authorizeRoles("interviewee"),
    getMyFeedbacks
);

router.get("/:sessionId", 
    protect, 
    authorizeRoles("interviewee"), 
    getSingleFeedback
);

module.exports = router;