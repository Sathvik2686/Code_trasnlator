import History from "../models/History.js";

export const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // 👉 call your execution service here (Judge0 or local)
    const output = "Simulated output"; // replace with real execution

    // 🔥 SAVE HISTORY
    await History.create({
      user: req.user.id,
      originalCode: code,
      output,
      sourceLang: language,
      targetLang: language,
      type: "run"
    });

    res.json({ stdout: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Execution failed" });
  }
};