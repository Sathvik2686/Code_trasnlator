import axios from "axios";
import Translation from "../models/Translation.js";

export const translateCode = async (req, res) => {
  try {
    const { code, sourceLang, targetLang } = req.body;

    if (!code || !sourceLang || !targetLang) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const prompt = `
You are a code translator.

Convert the following ${sourceLang} code into ${targetLang}.

Rules:
- Return ONLY the translated code
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include text

Code:
${code}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let translatedCode = response.data.choices[0].message.content;

    translatedCode = translatedCode
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/```/g, "")
      .trim();

    await Translation.create({
      sourceLang,
      targetLang,
      originalCode: code,
      translatedCode
    });

    res.json({ translatedCode });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Translation failed" });
  }
};