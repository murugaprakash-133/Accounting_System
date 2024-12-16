import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate emails
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regular expression for basic email validation
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6 // Ensures a minimum length of 6 characters
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const User = mongoose.model("User", userSchema);

export default User;
