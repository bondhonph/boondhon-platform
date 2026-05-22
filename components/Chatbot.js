import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

const QUICK_REPLIES = [
  '💰 দাম জানতে চাই',
  '🌸 Affordable কার্ড দেখাও',
  '✨ Premium কার্ড দেখাও',
  '🚚 ডেলিভারি তথ্য',
  '📝 অর্ডার করব',
];

const WELCOME = {
  role: 'bot',
  content: 'আসসালামু আলাইকুম! 🌸 আমি Payel, BOONDHON-এর AI সহকারী। আপনাকে কীভাবে সাহায্য করতে পারি? 😊'
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'bot' || m !== WELCOME)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: msg }] })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'একটু সমস্যা হচ্ছে। WhatsApp করুন: 01701016826 🥰' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 rounded-full shadow-2xl shadow-brand-blue/40 flex items-center justify-center hover:scale-110 transition-transform"
        style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={26} className="text-white" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{unread}</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
          style={{ height: '520px', border: '1px solid rgba(41,171,226,0.25)', background: 'rgba(6,16,32,0.97)', backdropFilter: 'blur(20px)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-brand-blue/10 bg-gradient-to-r from-brand-blue/20 to-transparent">
            <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-lg">🌸</div>
            <div>
              <p className="text-white font-semibold text-sm">Payel</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-green-400 text-xs">Online · BOONDHON</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-gray-500 hover:text-white transition-colors">
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-bot text-gray-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="chat-bubble-bot px-4 py-3">
                  <span className="typing-dot"></span>
                  <span className="typing-dot mx-1"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            {/* Quick replies */}
            {messages.length <= 2 && !loading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_REPLIES.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-xs bg-brand-blue/10 border border-brand-blue/20 text-brand-blue px-3 py-2 rounded-full hover:bg-brand-blue/20 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-brand-blue/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-blue focus:outline-none transition-all"
              />
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center hover:bg-blue-400 transition-all disabled:opacity-40">
                <Send size={16} className="text-white" />
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <a href="https://wa.me/8801701016826" target="_blank" rel="noreferrer"
                className="text-green-400 text-xs hover:underline">💬 WhatsApp করুন</a>
              <a href="/order" className="text-brand-blue text-xs hover:underline">📝 অর্ডার করুন</a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(41,171,226,0.4); }
          50% { box-shadow: 0 0 40px rgba(41,171,226,0.8); }
        }
      `}</style>
    </>
  );
}