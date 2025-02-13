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

export const sendOtpEmail = async (email, otp, role, name = "User") => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const recipientEmail = role === "Admin" ? process.env.ADMIN_VERIFICATION_EMAIL : email;

  // Define dynamic subject lines
  const subject =
    role === "Admin"
      ? "Admin Access Request - OTP Verification Required"
      : "Welcome to CyborgForge! Verify Your Account with OTP";

  // Define dynamic email body
  const mailBody =
    role === "Admin"
      ? `<p>An admin registration request has been received.</p>
         <p><strong>Requester Details:</strong></p>
         <p>Name: ${name}</p>
         <p>Email: ${email}</p>
         <p>To approve and proceed with the request, use the OTP below:</p>
         <p><strong>${otp}</strong></p>`
      : `<p>Welcome to CyborgForge! We are dedicated to innovation in drone technology and AI-driven solutions.</p>
         <p>To complete your registration, please use the OTP below:</p>
         <p><strong>${otp}</strong></p>
         <p>We look forward to having you on board!</p>`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: subject,
    html: mailBody,
  };

  await transporter.sendMail(mailOptions);
};

