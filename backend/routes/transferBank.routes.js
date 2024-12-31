import express from "express";
import {
  createTransferBank,
  getTransferBanks,
  updateTransferBank,
  deleteTransferBank,
} from "../controllers/transferBank.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createTransferBank);
router.get("/", protectRoute, getTransferBanks);
router.put("/:transactionId", protectRoute, updateTransferBank);
router.delete("/:transactionId", protectRoute, deleteTransferBank);

export default router;
