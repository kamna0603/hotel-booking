import User from "../models/User.js";
import { getAuth } from "@clerk/express";
import connectDB from "../configs/db.js";
export const protect = async (req, res, next) => {
    try {
        await connectDB();
        console.log("DB connected");
        
        const { userId } = getAuth(req);
        console.log("userId:", userId); // 👈 add this
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not Authenticated" });
        }

        const user = await User.findOne({ clerkId: userId });
        console.log("user found:", user ? "YES" : "NO"); // 👈 add this
        
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("PROTECT ERROR:", error.message); // 👈 change to error.message
        return res.status(500).json({ success: false, message: "Auth error" });
    }
};