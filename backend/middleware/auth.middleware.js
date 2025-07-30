import User from "../models/auth.model.js";
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res , next) => {
    try {
        // Show me your wristband
        const token = req.cookies.jwt ; 
        // No wristband ? Sorry , you can't enter the club
        if (!token){
            return res.status(401).json({error : "Unauthorized - No token provided"})
        }
        // bouncer scan your wristband to ensure it's not fake
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        // Your wristband is fake or expired . Get outta here
        if (!decoded){
            return res.status(401).json({error : "Unauthorized - No token provided"})

        }
        // To confirm you are VIP
        const user = await User.findById(decoded.userId).select("-password");
        // Your wristband’s good, but you’re not on the list anymore.
        if (!user){
            return res.status(404).json({ error : "User not found"})
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}