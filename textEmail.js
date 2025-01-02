import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kalaiarasankaruppaiya@gmail.com", // Replace with your email
    pass: "essxbuwysdzqkedb",   // Replace with your App Password
  },
});

const mailOptions = {
  from: "kalaiarasankaruppaiya@gmail.com",
  to: "laishunoffi@example.com", // Replace with the recipient email
  subject: "Test Email",
  text: "This is a test email sent from Nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("Error sending email:", error);
  }
  // console.log("Email sent successfully:", info.response);
});