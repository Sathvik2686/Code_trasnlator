import { useEffect, useState } from "react";
import API from "../services/api";

export default function HistorySidebar({ onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/history");
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-64 bg-gray-900 p-3 overflow-y-auto h-screen">
      <h2 className="text-white font-bold mb-3">History</h2>

      {history.map((item, i) => (
        <div
          key={i}
          onClick={() => onSelect(item)}
          className="mb-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
        >
          <p className="text-xs text-gray-400">
            {item.sourceLang} → {item.targetLang}
          </p>
          <pre className="text-xs text-white">
            {item.originalCode.slice(0, 40)}...
          </pre>
        </div>
      ))}
    </div>
  );
}