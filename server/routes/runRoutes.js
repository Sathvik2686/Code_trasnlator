import express from "express";
import axios from "axios";

const router = express.Router();

// 🔥 FIXED LANGUAGE MAP FOR PISTON
const getPistonLang = (lang) => {
  switch (lang) {
    case "python":
      return "python3";     // ✅ FIX
    case "javascript":
      return "nodejs";      // ✅ FIX
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    default:
      return "python3";
  }
};

router.post("/", async (req, res) => {
  try {
    const { code, language } = req.body;

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: getPistonLang(language), // ✅ FIXED HERE
        version: "*",
        files: [
          {
            content: code
          }
        ]
      }
    );

    const result = response.data.run;

    res.json({
      stdout: result.stdout,
      stderr: result.stderr
    });

  } catch (err) {
    console.error("PISTON ERROR:", err.response?.data || err.message);

    res.status(500).json({
      message: "Execution failed"
    });
  }
});

export default router;