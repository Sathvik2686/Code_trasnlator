import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  translateSmart,
  explainCode,
  fixCode,
  reviewCode,
  optimizeCode,
  generateTestCases,
  analyzeDSA
} from "../controllers/aiController.js";

const router = express.Router();

/* 🔥 PROTECTED AI ROUTES */
router.post("/translate", authMiddleware, translateSmart);
router.post("/explain", authMiddleware, explainCode);
router.post("/fix", authMiddleware, fixCode);
router.post("/review", authMiddleware, reviewCode);

/* 🔥 NEW FEATURES */
router.post("/optimize", authMiddleware, optimizeCode);
router.post("/testcases", authMiddleware, generateTestCases);
router.post("/analyze", authMiddleware, analyzeDSA);

export default router;