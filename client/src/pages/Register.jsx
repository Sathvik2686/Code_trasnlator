import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 NEW STATES
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    // ✅ FRONTEND VALIDATION
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", {
        name,
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      // ✅ small delay (better UX)
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);

      // 🔥 REAL BACKEND MESSAGE
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0b0f14] text-white flex flex-col relative overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">

        <button onClick={() => navigate("/")} className="back-btn">
          <span className="arrow">←</span> Back
        </button>

        <h1 className="text-cyan-400 font-bold">AI CODE STUDIO ⚡</h1>

        <div />

      </div>

      {/* CENTER */}
      <div className="flex flex-1 justify-center items-center">

        <div className="w-[360px] p-6 border border-gray-800 bg-[#0f141a] rounded-xl shadow-lg">

          <h2 className="text-xl mb-6 font-bold text-center text-cyan-400">
            REGISTER
          </h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-neon"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-neon"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-neon"
          />

          {/* 🔥 ERROR UI */}
          {error && <div className="error-box">{error}</div>}

          <button
            onClick={handleRegister}
            className="btn-neon w-full mt-4"
            disabled={loading}
          >
            {loading ? <span className="loader" /> : "CREATE"}
          </button>

          <p className="text-sm mt-4 text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline">
              Login
            </Link>
          </p>

        </div>

      </div>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-cyan-500 opacity-10 blur-3xl rounded-full"></div>

      {/* STYLES */}
      <style>{`
        .input-neon {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          background: #0b0f14;
          border: 1px solid #00ffff55;
          border-radius: 6px;
          outline: none;
          color: white;
        }

        .input-neon:focus {
          border-color: #00ffff;
          box-shadow: 0 0 8px #00ffff55;
        }

        .btn-neon {
          padding: 10px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 6px;
          transition: 0.2s;
        }

        .btn-neon:hover {
          background: #00ffff;
          color: black;
          box-shadow: 0 0 12px #00ffff;
        }

        .btn-neon:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-box {
          background: #ff4d4d22;
          border: 1px solid #ff4d4d;
          padding: 8px;
          margin-bottom: 10px;
          border-radius: 6px;
          font-size: 12px;
          color: #ff4d4d;
        }

        .loader {
          border: 2px solid #00ffff55;
          border-top: 2px solid #00ffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border: 1px solid #00ffff55;
          color: #00ffff;
          border-radius: 6px;
          transition: 0.2s;
        }

        .back-btn:hover {
          background: #00ffff;
          color: black;
          box-shadow: 0 0 10px #00ffff;
        }

        .arrow {
          transition: transform 0.2s ease;
        }

        .back-btn:hover .arrow {
          transform: translateX(-4px);
        }
      `}</style>

    </div>
  );
}