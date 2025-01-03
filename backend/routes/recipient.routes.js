import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  addRecipient,
  deleteRecipient,
  getRecipients,
} from "../controllers/recipient.controller.js";

const router = express.Router();

// Add a new recipient
router.post("/add", protectRoute, addRecipient);

// Delete a recipient
router.delete("/delete/:id", protectRoute, deleteRecipient);

// Get all recipients
router.get("/", protectRoute, getRecipients);

export default router;
