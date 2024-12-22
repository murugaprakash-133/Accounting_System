import express from "express";
import {
  createTransfer,
  getTransfers,
  updateTransfer,
  deleteTransfer,
} from "../controllers/transfer.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createTransfer);
router.get("/", protectRoute, getTransfers);
router.put("/:transferId", protectRoute, updateTransfer);
router.delete("/:transferId", protectRoute, deleteTransfer);

export default router;