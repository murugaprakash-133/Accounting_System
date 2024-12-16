import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUserForProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserForProfile);

export default router;