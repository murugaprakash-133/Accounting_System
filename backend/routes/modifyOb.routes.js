import express from "express";
import { createModifyOpenBalance, getLastModifiedBalancesForBothBanks } from "../controllers/modifyOb.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Route to create a ModifyOpenBalance entry
router.post("/", protectRoute, createModifyOpenBalance);

// Route to fetch the last modified balance (modified OB)
router.get("/lastModifiedBalancesForBothBanks", protectRoute, getLastModifiedBalancesForBothBanks);

export default router;
