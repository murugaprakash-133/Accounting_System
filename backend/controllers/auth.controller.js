import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenandSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;
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
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPassword = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenandSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
