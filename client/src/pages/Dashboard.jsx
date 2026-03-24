import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ✅ FIXED AUTH (THIS WAS BREAKING YOUR UI)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

    setLoadingAuth(false);
  }, [navigate]);

  const [code, setCode] = useState("// Write your code here...");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [targetLang, setTargetLang] = useState("javascript");

  const [activeAI, setActiveAI] = useState(null);
  const [runLoading, setRunLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  const [deletedItem, setDeletedItem] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const isBusy = runLoading || activeAI !== null;

  useEffect(() => {
    API.get("/history").then((res) => setHistory(res.data || []));
  }, []);

  const isValidCode = (code) => {
    const patterns = [
      /[{};]/,
      /\b(function|class|def|return|if|for|while)\b/,
      /\b(console\.log|print)\b/,
      /=|=>/
    ];
    return patterns.some((p) => p.test(code));
  };

  const detectLanguage = (code) => {
    if (/#include|cout|cin/.test(code)) return "cpp";
    if (/System\.out\.println|public class/.test(code)) return "java";
    if (/def |print\(|import /.test(code)) return "python";
    if (/console\.log|function|=>/.test(code)) return "javascript";
    return targetLang;
  };

  useEffect(() => {
    const detected = detectLanguage(code);
    if (detected !== targetLang) setTargetLang(detected);
  }, [code]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") handleRun();
      if (e.ctrlKey && e.key === "l") setResult("");
      if (e.ctrlKey && e.key === "e") runAI("/ai/explain");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code]);

  // ✅ FIXED RUN
  const handleRun = async () => {
    if (!code.trim()) {
      setResult("⚠️ Please enter code");
      return;
    }

    if (!isValidCode(code)) {
      setResult("⚠️ Enter valid code only (not plain text)");
      return;
    }

    setRunLoading(true);
    setResult("");

    try {
      const res = await API.post("/run", {
        code,
        language: targetLang,
        input
      });

      setResult(res.data.stdout || res.data.stderr || "No output");
    } catch (err) {
      setResult(err.response?.data?.error || "⚠️ Run failed");
    } finally {
      setRunLoading(false);
    }
  };

  // ✅ FIXED AI
  const runAI = async (endpoint) => {
    if (!code.trim()) {
      setResult("⚠️ Please enter code");
      return;
    }

    if (!isValidCode(code)) {
      setResult("⚠️ Enter valid code only (not plain text)");
      return;
    }

    setActiveAI(endpoint);
    setResult("");

    try {
      const res = await API.post(endpoint, { code, targetLang });
      setResult(res.data.output || res.data.translatedCode || "No output");

    } catch (err) {

      if (err.response?.status === 429) {
        setResult("⚠️ Too many requests. Wait 1 minute.");
      } else if (err.response?.data?.message) {
        setResult(`⚠️ ${err.response.data.message}`);
      } else {
        setResult("⚠️ Something went wrong");
      }

    } finally {
      setActiveAI(null);
    }
  };

  const handleDelete = async (id) => {
    const item = history.find((i) => i._id === id);
    if (!item) return;

    setHistory((prev) => prev.filter((i) => i._id !== id));
    setDeletedItem(item);

    try {
      await API.delete(`/history/${id}`);
    } catch {
      alert("Delete failed");
    }

    const timer = setTimeout(() => {
      setDeletedItem(null);
    }, 5000);

    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (!deletedItem) return;
    clearTimeout(undoTimer);
    setHistory((prev) => [deletedItem, ...prev]);
    setDeletedItem(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredHistory = history.filter((item) =>
    item.originalCode?.toLowerCase().includes(search.toLowerCase())
  );

  const formatOutput = (text) => {
    if (!text) return "";

    return text
      .replace(/^\d+\.\s(.+)$/gm, "\n=== $1 ===\n")
      .replace(/^- /gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  if (loadingAuth) return null;

  return (
    <div className="h-screen bg-[#0b0f14] text-white flex flex-col overflow-hidden">

      {/* 🔥 YOUR ORIGINAL UI — NOT TOUCHED BELOW */}

      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
        <h1 className="text-cyan-400 font-bold">AI CODE STUDIO ⚡</h1>
        <button onClick={handleLogout} className="btn-neon-sm">Logout</button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT HISTORY */}
        <div className="w-64 border-r border-gray-800 p-3 flex flex-col">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-neon mb-3"
          />

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredHistory.map((item) => (
              <div key={item._id} className="history-card flex justify-between">

                <div
                  onClick={() => {
                    setCode(item.originalCode);
                    setResult(item.output);
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="text-cyan-400 text-xs font-semibold">
                    {item.sourceLang} → {item.targetLang}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {item.originalCode?.slice(0, 40)}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="delete-btn"
                  disabled={isBusy}
                >
                  ✕
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* CENTER + RIGHT */}
        <div className="flex flex-1 overflow-hidden">

          <div className="flex-1 flex flex-col overflow-hidden">

            {/* BUTTON BAR */}
            <div className="flex gap-2 p-3 border-b border-gray-800 flex-wrap">

              <button onClick={handleRun} className="btn-neon" disabled={isBusy}>
                {runLoading ? <span className="loader" /> : "Run"}
              </button>

              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="input-neon"
              >
                <option value="javascript">JS</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              {["translate","explain","fix","review","optimize","testcases","analyze"].map((type) => (
                <button
                  key={type}
                  onClick={() => runAI(`/ai/${type}`)}
                  className="btn-neon"
                  disabled={isBusy}
                >
                  {activeAI === `/ai/${type}` ? <span className="loader" /> : type}
                </button>
              ))}

            </div>

            {/* EDITOR */}
            <div className="flex-1">
              <Editor
                height="100%"
                value={code}
                onChange={(v) => setCode(v)}
                theme="vs-dark"
              />
            </div>

            {/* INPUT */}
            <textarea
              placeholder="Input..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-28 bg-[#0b0f14] border-t border-gray-800 p-2"
            />
          </div>

          {/* TERMINAL */}
          <div className="w-[40%] border-l border-gray-800 flex flex-col">

            <div className="flex justify-between px-3 py-2 border-b border-gray-800">
              <span className="text-cyan-400 text-sm">TERMINAL</span>

              <div className="flex gap-2">
                <button onClick={() => setResult("")} className="btn-neon-sm">Clear</button>
                <button onClick={() => result && navigator.clipboard.writeText(result)} className="btn-neon-sm">Copy</button>
                <button
                  onClick={() => {
                    if (!result) return;
                    const blob = new Blob([result], { type: "text/plain" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "output.txt";
                    a.click();
                  }}
                  className="btn-neon-sm"
                >
                  Download
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-y-auto p-3 text-green-400 text-sm">
              {formatOutput(result || "Run or use AI to see output...")}
            </pre>

          </div>

        </div>
      </div>

      {/* UNDO */}
      {deletedItem && (
        <div className="fixed bottom-5 right-5 bg-[#111] border border-cyan-500 px-4 py-2 rounded flex gap-3">
          <span>Item deleted</span>
          <button onClick={handleUndo} className="btn-neon-sm">Undo</button>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .btn-neon {
          padding: 4px 12px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 6px;
        }
        .btn-neon:hover {
          box-shadow: 0 0 10px #00ffff;
        }
        .btn-neon-sm {
          padding: 4px 10px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 6px;
        }
        .btn-neon-sm:hover {
          box-shadow: 0 0 8px #00ffff;
        }
        .input-neon {
          border: 1px solid #00ffff33;
          background: transparent;
          padding: 4px;
          border-radius: 5px;
          color: white;
        }
        .history-card {
          padding: 8px;
          border-radius: 8px;
          background: #111;
        }
        .history-card:hover {
          box-shadow: 0 0 10px #00ffff;
        }
        .delete-btn {
          color: red;
          font-size: 12px;
          border: 1px solid #ff444455;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .delete-btn:hover {
          background: red;
          color: white;
          box-shadow: 0 0 8px red;
        }
        .loader {
          width: 14px;
          height: 14px;
          border: 2px solid #555;
          border-top: 2px solid #00ffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}