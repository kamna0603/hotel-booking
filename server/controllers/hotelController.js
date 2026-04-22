import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { getAuth } from "@clerk/express";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;

    const { userId: owner } = getAuth(req); 

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Not Authenticated",
      });
    }

    // For listing one property per single user
    // const hotel = await Hotel.findOne({ owner });
    // if (hotel) {
    //   return res.json({
    //     success: false,
    //     message: "Hotel Already Registered..",
    //   });
    // }

    await Hotel.create({ name, address, contact, city, owner });
    await User.findOneAndUpdate({ clerkId: owner }, { role: "hotelOwner" });


    res.json({
      success: true,
      message: "Hotel Registered Successfully...",
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};