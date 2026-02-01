const User = require("../models/User");

const getProfile = async (req,res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
};

const updateProfile = async (req,res) => {
    const user = await User.findById(re.user._id);

    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        user.skills = req.body.skills || user.skills;
        user.bio = req.body.bio || user.bio;
        user.experienceYears = req.body.experienceYears || user.experienceYears;

        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            skills: updatedUser.skills,
            bio: updatedUser.bio,
            experienceYears: updatedUser.experienceYears,
            role: updatedUser.role,
            rating: updatedUser.rating
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

module.exports = { getProfile, updateProfile };