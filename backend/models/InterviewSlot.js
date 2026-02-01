const mongoose = require("mongoose");

const interviewSlotSchema = new mongoose.Schema({
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    actualStartTime: { type: Date, default: null },
    actualEndTime: { type: Date, default: null },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["available", "booked", "completed", "cancelled"], default: "available" },
    roomId: {type: String}
},
{ timestamps: true }
);

const InterviewSlot = mongoose.model("InterviewSlot", interviewSlotSchema);

module.exports = InterviewSlot;