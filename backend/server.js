import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import transferRoutes from "./routes/transfer.routes.js";
import transferBankRoutes from "./routes/transferbank.routes.js";
import recipientRoutes from "./routes/recipient.routes.js";

// import modifyObRoutes from "./routes/modifyOb.routes.js"; // Import modifyOb routes

import connectToMongoDB from "./db/connectToMongoDB.js";
import "./utils/excel.scheduler.js";

const app = express();

// Load environment variables
dotenv.config();

// Get port from .env file or default to 5000
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(cookieParser());

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and other credentials
  })
);

// Auth routes middleware
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Transaction routes middleware
app.use("/api/transactions", transactionRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/transferBanks", transferBankRoutes);
app.use("/api/recipients", recipientRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

// ModifyOpenBalance routes middleware
// app.use("/api/modifyOb", modifyObRoutes); // Add this route

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});
