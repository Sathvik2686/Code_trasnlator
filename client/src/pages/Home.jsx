import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const words = [
    "WRITE.",
    "FIX.",
    "TRANSLATE.",
    "OPTIMIZE.",
    "ANALYZE."
  ];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && text === currentWord) {
      setTimeout(() => setIsDeleting(true), 1000);
      return;
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setText((prev) =>
        isDeleting
          ? currentWord.substring(0, prev.length - 1)
          : currentWord.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  const features = [
    "Run Code",
    "Translate",
    "Explain",
    "Fix Bugs",
    "Review",
    "Optimize",
    "Test Cases",
    "Analyze"
  ];

  return (
    <div className="h-screen bg-[#0b0f14] text-white flex flex-col overflow-hidden relative">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
        <h1 className="text-cyan-400 font-bold">AI CODE STUDIO ⚡</h1>

        <div className="flex gap-2">
          <Link to="/login">
            <button className="btn-neon-sm">Login</button>
          </Link>
          <Link to="/register">
            <button className="btn-neon-sm">Register</button>
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">

        <h1 className="text-5xl md:text-6xl font-bold mb-6 h-[80px] flex items-center">
          <span className="text-cyan-400 glow-text">{text}</span>
          <span className="cursor"></span>
        </h1>

        <p className="text-gray-400 mb-8 max-w-xl">
          A powerful AI coding workspace to run, debug, translate,
          optimize, and deeply analyze your code — all in one place.
        </p>

        {/* 🔥 FEATURE BADGES */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map((f, i) => (
            <span key={i} className="badge">
              {f}
            </span>
          ))}
        </div>

        <Link to="/login">
          <button className="btn-cta">START CODING →</button>
        </Link>

      </div>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500 opacity-10 blur-3xl rounded-full"></div>

      {/* STYLES */}
      <style>{`
        .btn-neon-sm {
          padding: 4px 10px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 6px;
        }

        .btn-neon-sm:hover {
          box-shadow: 0 0 8px #00ffff;
        }

        .btn-cta {
          padding: 10px 26px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 8px;
          transition: 0.2s;
        }

        .btn-cta:hover {
          background: #00ffff;
          color: black;
          box-shadow: 0 0 20px #00ffff;
        }

        .glow-text {
          text-shadow: 0 0 10px #00ffff;
        }

        .cursor {
          display: inline-block;
          width: 3px;
          height: 40px;
          background: #00ffff;
          margin-left: 6px;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }

        /* 🔥 BADGES */
        .badge {
          padding: 6px 14px;
          border: 1px solid #00ffff55;
          border-radius: 20px;
          font-size: 12px;
          color: #00ffff;
          transition: 0.2s;
          cursor: default;
        }

        .badge:hover {
          background: #00ffff;
          color: black;
          box-shadow: 0 0 12px #00ffff;
        }
      `}</style>

    </div>
  );
}