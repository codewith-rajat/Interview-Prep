const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    session:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSlot",
        required: true
    },
    interviewer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    interviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {type: Number, min: 1, max: 5, required: true},

    technicalSkills: {type: Number, min: 1, max: 5, required: true},
    communicationSkills: {type: Number, min: 1, max: 5, required: true},
    problemSolvingSkills: {type: Number, min: 1, max: 5, required: true},
    confidence: {type: Number, min: 1, max: 5, required: true},
    
    strengths: {type: String, required: true},
    improvements: {type: String, required: true},
    
    overallFeedback: {type: String, required: true},
},{timestamps: true});

module.exports = mongoose.model("Feedback", feedbackSchema);