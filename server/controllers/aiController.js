import axios from "axios";
import Translation from "../models/Translation.js";
import History from "../models/History.js";

/* 🔥 VALIDATION (UPGRADED) */
const validateCode = (code, res) => {
  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "Code is required" });
  }

  const trimmed = code.trim();

  if (trimmed.length < 3) {
    return res.status(400).json({ message: "Code too short" });
  }

  if (trimmed.length > 5000) {
    return res.status(400).json({ message: "Code too long (max 5000 chars)" });
  }

  // 🔥 must look like code
  const looksLikeCode = /[{};=()<>]|(function|class|def|return|if|for|while)/i.test(trimmed);

  if (!looksLikeCode) {
    return res.status(400).json({ message: "Invalid input: must be code" });
  }

  // 🔥 spam protection
  const spamPattern = /(.)\1{20,}/;
  if (spamPattern.test(trimmed)) {
    return res.status(400).json({ message: "Invalid repetitive input" });
  }

  return true;
};

/* 🔥 NORMALIZE LANGUAGE */
const normalize = (lang) => {
  if (!lang) return "python";
  lang = lang.toLowerCase();

  if (lang.includes("python")) return "python";
  if (lang.includes("javascript") || lang.includes("js")) return "javascript";
  if (lang.includes("java")) return "java";
  if (lang.includes("c++")) return "cpp";
  if (lang.includes("c#")) return "csharp";

  return "python";
};

/* 🔥 HISTORY SAVE */
const save = (req, code, output, type, sourceLang = "auto", targetLang = type) => {
  try {
    History.create({
      user: req.user?.id || null,
      originalCode: code,
      output,
      sourceLang,
      targetLang,
      type
    });
  } catch (err) {
    console.error("HISTORY ERROR:", err.message);
  }
};

/* 🔥 DELAY */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* 🔥 AI CALL */
const callAI = async (prompt) => {
  try {
    const safePrompt = prompt.slice(0, 2500);
    await delay(400);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: safePrompt }],
        max_tokens: 800,
        temperature: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || "No response";

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);

    if (error.response?.status === 429) throw new Error("Too many requests");
    if (error.response?.status === 402) throw new Error("API credits exhausted");

    throw new Error(error.response?.data?.error?.message || "AI request failed");
  }
};

/* 🔥 RETRY SYSTEM */
const callAIWithRetry = async (prompt, retries = 2) => {
  try {
    return await callAI(prompt);
  } catch (error) {
    console.error("⚠️ Retry failed:", error.message);

    if (retries === 0) {
      throw new Error("AI failed after retries");
    }

    await delay(600);
    return callAIWithRetry(prompt, retries - 1);
  }
};

/* 🔥 DETECT LANGUAGE */
const detectLanguageInternal = async (code) => {
  const result = await callAIWithRetry(`Detect language:\n\n${code}`);
  return normalize(result);
};

/* 🔥 TRANSLATE */
export const translateSmart = async (req, res) => {
  try {
    const { code, targetLang } = req.body;
    if (!validateCode(code, res)) return;

    const sourceLang = await detectLanguageInternal(code);

    let translatedCode = await callAIWithRetry(`
Convert ${sourceLang} → ${targetLang}.
Return ONLY code.

${code}
`);

    translatedCode = translatedCode
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```/g, "")
      .trim();

    await Translation.create({ sourceLang, targetLang, originalCode: code, translatedCode });

    save(req, code, translatedCode, "translate", sourceLang, targetLang);

    res.json({ sourceLang, targetLang, translatedCode });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 EXPLAIN */
export const explainCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Explain this code:\n\n${code}`);

    save(req, code, output, "explain");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 FIX */
export const fixCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Fix this code:\n\n${code}`);

    save(req, code, output, "fix");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 REVIEW */
export const reviewCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Review code (complexity + improvements):\n\n${code}`);

    save(req, code, output, "review");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 OPTIMIZE */
export const optimizeCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Optimize this code:\n\n${code}`);

    save(req, code, output, "optimize");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 TEST CASES */
export const generateTestCases = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Generate test cases:\n\n${code}`);

    save(req, code, output, "testcases");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔥 ANALYZE */
export const analyzeDSA = async (req, res) => {
  try {
    const { code } = req.body;
    if (!validateCode(code, res)) return;

    const output = await callAIWithRetry(`Analyze DSA (complexity, pattern, tips):\n\n${code}`);

    save(req, code, output, "analyze");

    res.json({ output });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};