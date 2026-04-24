import User from "../models/User.js";
import { getAuth } from "@clerk/express"; 


//Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
         const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token ? "YES" : "NO");  // 👈
    console.log("Token value:", token?.substring(0, 20));  
        const auth = getAuth(req);
    const { userId } = auth;
  
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not Authenticated" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("PROTECT ERROR:", error);
        return res.status(500).json({ success: false, message: "Auth error" });
    }
};




