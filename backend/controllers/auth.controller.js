import Otp from "../models/Otp.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import generateTokenandSetCookie from "../utils/generateToken.js";
import { sendOtpEmail } from "../utils/emailUtils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { email, name, password, confirmPassword, role, otp } = req.body;

    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    if (otp) {
      // Validate OTP
      const storedOtp = await Otp.findOne({ email });
      if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expiry) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Remove OTP after validation
      await Otp.deleteOne({ email });
    } else {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      // Generate OTP and store in the database
      const generatedOtp = crypto.randomInt(100000, 999999).toString();
      const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await Otp.findOneAndUpdate(
        { email },
        { otp: generatedOtp, expiry: expiryTime },
        { upsert: true }
      );

      console.log("Generated OTP:", generatedOtp," ",role);
      await sendOtpEmail(email, generatedOtp, role);

      return res.status(200).json({ message: "OTP sent to email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    generateTokenandSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email or password are missing
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // If the user is not found, return an error
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isPassword = await bcrypt.compare(password, user.password);

    // If the password is incorrect, return an error
    if (!isPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate token and set cookie
    generateTokenandSetCookie(user._id, res);

    // Return the user data along with the status code 200 if login is successful
    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    // console.log("Error in login controller", error.message);

    // Return internal server error if something goes wrong
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Validate OTP
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifying OTP:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user found with this email" });
    }

    // Generate OTP and store it in the database
    const generatedOtp = crypto.randomInt(100000, 999999).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    await Otp.findOneAndUpdate(
      { email },
      { otp: generatedOtp, expiry: expiryTime },
      { upsert: true }
    );

    // Send OTP email
    console.log("Generated OTP:", generatedOtp);
    await sendOtpEmail(email, generatedOtp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in sending OTP:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate OTP
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Remove OTP after successful reset
    await Otp.deleteOne({ email });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetting password:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("jwt", {
      httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      sameSite: "strict", // Prevents CSRF by limiting cookie sharing
    });

    // Send a success response
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);

    // Send an error response
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
