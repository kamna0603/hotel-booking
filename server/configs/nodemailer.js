import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// In nodemailer.js - add this:
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("SMTP Error:", error.message);
//   } else {
//     console.log("SMTP Server ready ✅");
//   }
// }); 
export default transporter