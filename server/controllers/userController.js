import { messageInRaw } from "svix";
import User from "../models/User.js";
import { getAuth } from "@clerk/express";

// GET /api/user/
// export const getUserData = async (req,res)=>{
//     try {
//         const role= req.user.role;
//         const recentSearchedCities= req.user.recentSearchedCities;
//         res.json({success:true,
//             role,recentSearchedCities
//         })
//     } catch (error) {
//         res.json({success:false,message:error.message})
//     }
// }

export const getUserData = async (req, res) => {
  try {
     const { userId } = getAuth(req);   

    const user = await User.findById(userId); 

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      role: user.role,
      recentSearchedCities: user.recentSearchedCities,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Store User Recent Searched cities
export const storeRecentSearchedCities=async(req,res)=>{
    try {
        const {recentSearchedCity}=req.body
          const { userId } = getAuth(req); 


    const user = await User.findById(userId); 

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity)
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)
        }

        await user.save();
        res.json({
            success:true,
            message:"City Added"
        })
    } catch (error) {

        res.json({
            success:false,
            message:error.message
        })
    }
};