import express from "express";
import { translateCode } from "../controllers/translateController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, translateCode);

export default router;