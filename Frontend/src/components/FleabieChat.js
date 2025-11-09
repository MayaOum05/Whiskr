import { useState } from "react";
import "./FleabieChat.css";

export default function FleabieChat({ petProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m Fleabie! 🐾 I can answer general pet care questions and help explain vet records. What would you like to talk about?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("general"); // "general" | "vet_summary"

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          petProfile,
          mode,
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I ran into a problem answering that. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fleabie-chat">
      <div className="fleabie-header">
        <h2>Fleabie AI Assistant 🐾</h2>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mode-select"
        >
          <option value="general">General questions</option>
          <option value="vet_summary">Explain vet notes</option>
        </select>
      </div>

      <div className="fleabie-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`message-bubble ${
              m.role === "user" ? "user" : "assistant"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="message-bubble assistant">
            Thinking like a little flea... 🪲
          </div>
        )}
      </div>

      <div className="fleabie-input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "vet_summary"
              ? "Paste your vet visit notes here and ask me to explain them..."
              : "Ask a general question about your pet’s care..."
          }
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
