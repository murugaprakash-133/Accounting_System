import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenandSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { email, name, password, confirmPassword, role } = req.body;
    // Validate required fields
    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token and set cookie
    try {
      generateTokenandSetCookie(newUser._id, res);
    } catch (error) {
      console.error("Token generation error:", error.message);
      res.status(500).json({ error: "Token generation failed" });
    }

    // generateTokenandSetCookie(newUser._id, res);

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

    // Generate token and set cookie (make sure generateTokenandSetCookie is implemented correctly)
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
