import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

/* ROUTES */
import authRoutes from "./routes/authRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import runRoutes from "./routes/runRoutes.js";

dotenv.config();

const app = express();

/* DB */
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB ERROR:", err));

/* MIDDLEWARE */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

/* 🔥 BODY LIMIT (SECURITY) */
app.use(express.json({
  limit: "10kb"
}));

/* 🔥 LOGGER (IMPORTANT) */
app.use(morgan("dev"));

/* 🔥 GLOBAL RATE LIMIT */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  }
});

app.use("/api", globalLimiter);

/* 🔥 AI RATE LIMIT */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many AI requests. Try again later."
  }
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/translate", translateRoutes);

/* 🔥 PROTECTED AI ROUTES */
app.use("/api/ai", aiLimiter, aiRoutes);

app.use("/api/history", historyRoutes);
app.use("/api/run", runRoutes);

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("🚀 AI Code Studio Backend Running");
});

/* 🔥 GLOBAL ERROR HANDLER (UPGRADED) */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR LOG START");
  console.error("Route:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("🔥 ERROR LOG END");

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* SERVER START */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});