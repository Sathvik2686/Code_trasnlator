import axios from "axios";

export const explainCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const prompt = `
You are a programming tutor.

Explain the following ${language} code clearly step by step.

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

    const explanation = response.data.choices[0].message.content;

    res.json({ explanation });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Explanation failed" });
  }
};