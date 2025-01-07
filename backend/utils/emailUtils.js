import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service (e.g., Gmail, Outlook)
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Replace with your email
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP for registration is: ${otp}`,
    html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
