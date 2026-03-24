import axios from "axios";

export const fixCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const prompt = `
You are a programming debugger.

Fix any bugs in the following ${language} code.

Return ONLY the corrected code.

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

    const fixedCode = response.data.choices[0].message.content;

    res.json({ fixedCode });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Bug fixing failed" });
  }
};