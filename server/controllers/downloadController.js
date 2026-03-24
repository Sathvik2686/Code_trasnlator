export const downloadCode = (req, res) => {

  const { code } = req.body;

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=translated_code.txt"
  );

  res.setHeader("Content-Type", "text/plain");

  res.send(code);
};