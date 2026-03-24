import express from "express";
import History from "../models/History.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ==============================
// ✅ GET ALL HISTORY
// ==============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const history = await History.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(history);

  } catch (error) {
    console.error("GET HISTORY ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch history"
    });
  }
});


// ==============================
// ✅ SAVE HISTORY (🔥 THIS WAS MISSING)
// ==============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { originalCode, output, sourceLang, targetLang } = req.body;

    const newHistory = await History.create({
      user: req.user.id,
      originalCode,
      output,
      sourceLang,
      targetLang,
    });

    res.json(newHistory);

  } catch (error) {
    console.error("SAVE HISTORY ERROR:", error);
    res.status(500).json({
      message: "Failed to save history"
    });
  }
});


// ==============================
// ✅ DELETE SINGLE HISTORY
// ==============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) {
      return res.status(404).json({ message: "History not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      message: "Failed to delete history"
    });
  }
});


// ==============================
// ✅ TOGGLE FAVORITE ⭐
// ==============================
router.put("/favorite/:id", authMiddleware, async (req, res) => {
  try {
    const item = await History.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) {
      return res.status(404).json({ message: "History not found" });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json(item);

  } catch (error) {
    console.error("FAVORITE ERROR:", error);
    res.status(500).json({
      message: "Failed to update favorite"
    });
  }
});


// ==============================
// ✅ CLEAR ALL HISTORY
// ==============================
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await History.deleteMany({ user: req.user.id });

    res.json({ message: "All history cleared" });

  } catch (error) {
    console.error("CLEAR ALL ERROR:", error);
    res.status(500).json({
      message: "Failed to clear history"
    });
  }
});

export default router;