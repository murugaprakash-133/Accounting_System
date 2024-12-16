import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Create a new transaction (protected route)
router.post("/", protectRoute, createTransaction);

// Get all transactions for a user (protected route)
router.get("/", protectRoute, getTransactions);

// Update a transaction by ID (protected route)
router.put("/:transactionId", protectRoute, updateTransaction);

// Delete a transaction by ID (protected route)
router.delete("/:transactionId", protectRoute, deleteTransaction);

export default router;
