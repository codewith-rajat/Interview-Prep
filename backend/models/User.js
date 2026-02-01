const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique:true, required: true },
    password: { type: String, required: true },
    role:{
        type: String,
        enum: ["interviewee", "interviewer", "admin"],
        default: "interviewee"
    },
    skills: [{ type: String }],
    bio: String,
    experienceYears: Number,
    rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;