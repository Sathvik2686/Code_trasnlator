export const getLanguages = (req, res) => {

  const languages = [
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "Go",
    "Rust",
    "TypeScript"
  ];

  res.json(languages);

};