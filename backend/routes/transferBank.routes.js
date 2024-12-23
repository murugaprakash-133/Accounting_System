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
router.put("/:transferBankId", protectRoute, updateTransferBank);
router.delete("/:transferBankId", protectRoute, deleteTransferBank);

export default router;
