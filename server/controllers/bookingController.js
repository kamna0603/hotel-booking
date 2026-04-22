import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { getAuth } from "@clerk/express";
import transporter from "../configs/nodemailer.js";
import User from "../models/User.js";

/// Function to check Availablity of Room
const checkAvailability = async({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.log(error.message);
  }
};

// API to check availability of room
//POST /api/bookings/check-availablity
export const checkAvailabilityAPI = async(req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API to create a new booking
// POST /api/bookings/book

export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const { userId: user } = getAuth(req);
    
    //Before Booking Check Availability
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is Not Available...",
      });
    }

    // Get TotalPrice from Room
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    //Calculate totalPrice based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
        const userData = await User.findById(user)


    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "keagan.harris73@ethereal.email",
      subject: "Hotel Booking Details",
      html: `
<h2>Your Booking Details</h2>
<p>Dear ${userData.username},</p>
<p>Thank You for your booking! Here are Your Details:</p>
<ul>
<li><strong>Booking ID:</strong> ${booking._id}</li>
<li><strong>Hotel Name :</strong> ${roomData.hotel.name}</li>
<li><strong>Location:</strong> ${roomData.hotel.address}</li>
<li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
<li><strong>Booking Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice} /night</li>

</ul>
<p>We look Forward to Welcoming You!</p>
<p>If you need to make any changes, feel free to contact us.</p>
`,
    };
   
try {
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.response);
} catch (emailError) {
  console.log("Email failed:", emailError.message);
}

    res.json({
      success: true,
      message: "Booking Created Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// APi to get all bbokings fo a user
// GET /api/bookings/user

export const getUserBookings = async (req, res) => {
  try {
    const { userId: user } = getAuth(req);
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: "Failed to Fetch Bookings...." });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const hotel = await Hotel.findOne({ owner: userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel Found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    //Total Bookings
    const totalBookings = bookings.length;

    //Total Revenue
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );
    res.json({
      success: true,
      dashboardData: {
        totalBookings,
        totalRevenue,
        bookings,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch Bookings",
    });
  }
};
