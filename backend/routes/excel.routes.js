import { generateAndSendExcel } from "../controllers/excel.controller.js";
import express from "express";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Route to generate and send Excel file
router.post("/send-excel",protectRoute, generateAndSendExcel);

export default router;