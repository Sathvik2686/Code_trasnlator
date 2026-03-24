import History from "../models/History.js";

// 🔥 SAVE HISTORY
export const saveHistory = async (req, res) => {
  try {
    const { originalCode, translatedCode, targetLang } = req.body;

    const history = await History.create({
      user: req.user.id, // ✅ FIXED
      originalCode,
      translatedCode,
      targetLang
    });

    res.json(history);

  } catch (err) {
    console.error("SAVE HISTORY ERROR:", err);
    res.status(500).json({ message: "Error saving history" });
  }
};

// 🔥 GET USER HISTORY
export const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      user: req.user.id // ✅ FIXED
    }).sort({ createdAt: -1 });

    res.json(history);

  } catch (err) {
    console.error("GET HISTORY ERROR:", err);
    res.status(500).json({ message: "Error fetching history" });
  }
};