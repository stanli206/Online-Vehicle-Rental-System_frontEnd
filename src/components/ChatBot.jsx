import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageCircle, X, Send } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "";

const WELCOME = {
  role: "model",
  text: "Hi! I'm the RentGaadi Assistant. Ask me anything about booking a vehicle, payments, or your rentals.",
};

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send recent history (skip the static welcome message).
      const history = newMessages
        .slice(1, -1)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await axios.post(
        `${API_BASE}/api/gemini/chat`,
        { message: text, history },
        user?.token
          ? { headers: { Authorization: `Bearer ${user.token}` } }
          : {}
      );

      setMessages((prev) => [
        ...prev,
        { role: "model", text: res.data.reply },
      ]);

      // If the bot created a pending booking, redirect to Payment with its data.
      if (res.data.booking) {
        const booking = res.data.booking;
        setTimeout(() => {
          setOpen(false);
          navigate("/payment", { state: { booking } });
        }, 1200); // brief pause so the user reads the confirmation
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I couldn't respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
        aria-label="Open chat assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-80 max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="bg-blue-600 px-4 py-3 text-white">
            <p className="font-semibold">RentGaadi Assistant</p>
            <p className="text-xs text-blue-100">Ask about rentals & bookings</p>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 shadow"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-gray-500 shadow">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
