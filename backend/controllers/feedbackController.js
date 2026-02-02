const Feedback = require("../models/Feedback");
const InterviewSlot = require("../models/InterviewSlot");

exports.giveFeedback = async (req, res) => {
    try{
        const { sessionId, rating, technicalSkills, communicationSkills, problemSolvingSkills, confidence, strengths, improvements, overallFeedback } = req.body;
    
        const session = await InterviewSlot.findById(sessionId);
        
        if(!session) return res.status(404).json({msg: "Session not found"});

        //Only interviewer can give feedback
        if(session.interviewer.toString() !== req.user._id.toString()){
            return res.status(403).json({msg: "Not Interviewer can give feedback"});
        }

        //session must be completed
        if(session.status !== "completed"){
            return res.status(400).json({msg: "Feedback allowed only for completed sessions"});
        }

        const feedback = await Feedback.create({
            session: sessionId,
            interviewer: req.user._id,
            interviewee: req.bookedBy,
            rating,
            technicalSkills,
            communicationSkills,
            problemSolvingSkills,
            confidence,
            strengths,
            improvements,
            overallFeedback
        });
        res.status(201).json({msg: "Feedback submitted successfully", feedback});

    }catch(err){
        console.error(err);
        res.status(500).json({msg: "Server error"});
    }
};

// Interviewee can view their feedback
exports.getMyFeedbacks = async (req, res) => {
    try{
        const feedbacks = await Feedback.find({ interviewee: req.user._id })
            .populate("interviewer", "name email")
            .populate("session", "date startTime endTime");

        if(feedback.length === 0) return res.status(404).json({msg: "No feedback found"});

        res.status(200).json({
            totalSessions: feedback.length,
            feedbacks
        });
    }catch(err){
        console.error(err);
        res.status(500).json({msg: "Server error"});
    }
};

exports.getSingleFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const feedback = await Feedback.findOne({
      session: sessionId,
      interviewee: req.user._id   // security: sirf apna feedback dekh sake
    })
      .populate("interviewer", "name email")
      .populate("session", "date startTime endTime");

    if (!feedback) {
      return res.status(404).json({ msg: "Feedback not found for this session" });
    }

    res.status(200).json(feedback);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
