// import nodemailer from "nodemailer";

// export const sendOtpEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: "Gmail", // Use your email service (e.g., Gmail, Outlook)
//     auth: {
//       user: process.env.EMAIL_USER, // Your email
//       pass: process.env.EMAIL_PASS, // Your email password
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER, // Replace with your email
//     to: email,
//     subject: "Your OTP for Registration",
//     text: `Your OTP for registration is: ${otp}`,
//     html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
//   };

//   await transporter.sendMail(mailOptions);
// };


import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp, role) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });
  console.log(role);
  const recipientEmail = role === "Admin" ? process.env.ADMIN_VERIFICATION_EMAIL : email;

  // Define custom subjects for Admin and User
  const subject =
    role === "Admin"
      ? "Admin Account Verification - OTP Required"
      : "Your OTP for Account Registration";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: subject,
    text: `Your OTP for ${role} registration is: ${otp}`,
    html: `<p>Your OTP for ${role} registration is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};
