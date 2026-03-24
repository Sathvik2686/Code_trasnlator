import { useState } from "react";

export default function ChatSearchBar({ onSend }) {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[60%]">

      <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">

        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste code or ask anything..."
          className="flex-1 bg-transparent text-white outline-none resize-none placeholder-gray-400"
        />

        <button
          onClick={send}
          className="ml-3 bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 rounded-xl"
        >
          Send
        </button>

      </div>
    </div>
  );
}