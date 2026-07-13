const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
     let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: "Not Authorized,User not found" })
            }
            next();
        }
      catch(error)
      { 
        console.log("JWT ERROR:", error);
        res.status(401).json({message:"Not Authorized ,token failed"})
      }
    }
    else {
         
        res.status(401).json({ message: 'Not authorized, no token' });
    }
}

const admin = (req, res, next) => {

    if(req.user && req.user.role === 'admin')
    {
        next()
    }
    else
    {
        res.status(403).json({message:"Not Authorized as Admin"})
    }

}

module.exports = { protect, admin };