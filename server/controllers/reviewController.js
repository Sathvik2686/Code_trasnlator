import axios from "axios";

export const reviewCode = async (req, res) => {
  try {

    const { code, language } = req.body;

    const prompt = `
You are a senior software engineer.

Review the following ${language} code.

Provide:

1. Code quality feedback
2. Performance improvements
3. Security issues
4. Best practices

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

    const review = response.data.choices[0].message.content;

    res.json({ review });

  } catch (error) {

    res.status(500).json({ message: "Code review failed" });

  }
};