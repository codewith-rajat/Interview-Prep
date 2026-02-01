const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try{
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            next();
        }
        catch(err) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }       
    if(!token){
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

//  Check role (interviewer / interviewee / admin)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
