import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createTransaction);
router.get("/", protectRoute, getTransactions);
router.put("/:transactionId", protectRoute, updateTransaction);
router.delete("/:transactionId", protectRoute, deleteTransaction);

export default router;
