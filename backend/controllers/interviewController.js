const InterviewSlot = require("../models/InterviewSlot");
const { v4: uuidv4 } = require("uuid");

exports.createSlot = async (req,res) => {
    try {
        const { date,startTime,endTime } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if(start>=end){
            return res.status(400).json({msg:"End time must be after start time"});
        }

        const existingSlot = await InterviewSlot.findOne({
            interviewer: req.user.id,
            date: new Date(date),
            status: { $ne: "booked" },
            startTime: { $lt: end },
            endTime: { $gt: start }
        });

        if(existingSlot){
            return res.status(400).json({msg:"Slot already exists for the selected time range"});
        }

        const slot = await InterviewSlot.create({
            interviewer: req.user._id,
            date: new Date(date),   
            startTime: start,
            endTime: end,
            duration: (end-start) / (1000 * 60) // duration in minutes  
        });

        res.status(201).json({ msg:"Slot created successfully", slot });
    }catch (err) {
        res.status(500).json({ msg: "Error creating slot", error: err.message });
    }
};  

exports.getAvailableSlots = async (req, res) => {
    try{
        const slots = await InterviewSlot.find({ status: "available" }).populate("interviewer", "name bio experienceYears");
        res.status(200).json({ slots });
    }catch (err) {
        res.status(500).json({ msg: "Error fetching available slots", error: err.message });
    }
};

exports.bookSlot = async (req, res) => {
    try{
        //finding slot
        const existingSlot = await InterviewSlot.findById(req.params.id);
        if(!existingSlot) return res.status(404).json({ msg: "Slot not found" });

        // Check if slot is available
        if(existingSlot.status !== "available") return res.status(400).json({ msg: "Slot not available" });

        // Stopping interviewer to book slot for themselves
        if(existingSlot.interviewer.toString() == req.user._id.toString()){
            return res.status(400).json({ msg: "Interviewer cannot book their own slot" });
        }

        //book slot
        const slot = await InterviewSlot.findByIdAndUpdate(
            { _id: req.params.id, status: "available" },
            { status: "booked", bookedBy: req.user._id, roomId: uuidv4() },
            { new: true }
        );

        if(!slot) return res.status(404).json({ msg: "Slot already booked" });

        res.status(200).json({ msg: "Slot booked successfully", slot });
    }catch (err) {
        res.status(500).json({ msg: "Error booking slot", error: err.message });
    }
};

exports.getMySessions = async (req,res) => {
    try{
        let sessions;

        if(req.user.role === "interviewer"){
            sessions = await InterviewSlot.find({ interviewer: req.user._id }).populate("bookedBy", "name email");
        }else{
            sessions = await InterviewSlot.find({ bookedBy: req.user._id }).populate("interviewer", "name bio experienceYears");
        }

        res.status(200).json({ sessions });
    }catch (err) {
        res.status(500).json({ msg: "Error fetching sessions", error: err.message });
    }
};  


