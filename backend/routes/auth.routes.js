import express from "express";
import { login, logout, signup, sendPasswordResetOtp, resetPassword, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);
router.post("/forgot-password/verify-otp", verifyOtp);

export default router;
