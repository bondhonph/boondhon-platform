import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { driveUrl, AFFORDABLE_IDS, PREMIUM_IDS } from '../lib/data';
import { MessageCircle, X, Send, Minimize2, Phone, Image as ImageIcon, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const BANGLA_FORM_TEXT = `📝 বিয়ের কার্ডের বাংলা ফর্ম: 🌸

বর-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

কণে-
নামঃ
পিতাঃ
মাতাঃ
ঠিকানাঃ

গায়ে হলুদ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

শুভ বিবাহ-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

বৌ-ভাত-
তারিখ (ইংরেজি):
তারিখ (বাংলা):
রোজঃ
সময়ঃ
স্থানঃ

শুভেচ্ছান্তে নামঃ
প্রয়োজনে (ফোন):

🚚 কুরিয়ার ইনফো (নাম, মোবাইল, ঠিকানা):

(ফর্মটি কপি করে পূরণ করে পাঠান) 🥰`;

const ENGLISH_FORM_TEXT = `📝 Wedding Card English Form: ✨

Groom Name:
Father Name:
Mother Name:

Bride Name:
Father Name:
Mother Name:

Holud:
Day, Date, Time, Venue:

Wedding:
Day, Date, Time, Venue:

Reception:
Day, Date, Time, Venue:

RSVP Phone:
Regards:

🚚 Courier Info (Name, Mobile, Address):

(Copy, fill up and send back) 🥰`;

const DELIVERY_POLICY_TEXT = `🚚 ডেলিভারি ও পলিসি:

📍 অফিস: মানিকগঞ্জ
🏭 কারখানা: ফকিরাপুল, ঢাকা

📋 অর্ডারের নিয়ম:
১. মোট বিলের ৩০% অ্যাডভান্স
   বিকাশ/নগদ/রকেট: 01682588856 (পারসোনাল)
২. ডেমো ডিজাইন approve করার পর print
৩. জেলা শহরে ক্যাশ অন ডেলিভারি (৫-৭ কর্মদিবস)

📞 হটলাইন: 01701016826 | WhatsApp: 01863586302`;

const WELCOME = {
  role: 'bot',
  type: 'text',
  content: `আসসালামু আলাইকুম! 😊\nআমি **অনন্যা**, BOONDHON Printing House-এ আপনাকে স্বাগতম! 🌸\n\n🎁 **স্পেশাল অফার:** ২০০টি কার্ড অর্ডারে একটি প্রিমিয়াম নিকাহনামা সম্পূর্ণ **ফ্রি!**\n\nআমাদের সবচেয়ে জনপ্রিয় কালেকশন:\n💚 Affordable Card — সাশ্রয়ী দামে গর্জিয়াস ডিজাইন\n✨ Premium Card — রাজকীয় ও ফয়েল প্রিন্ট\n\nকোন কালেকশনটি দেখতে চান বলুন? 👇`
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendUserMessage = (text) => {
    if (!text || loading) return;

    const userText = text.trim();
    const newMsg = { role: 'user', type: 'text', content: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    const lower = userText.toLowerCase();

    setTimeout(async () => {
      // 1. Affordable Carousel Request
      if (lower.includes('affordable') || lower.includes('অ্যাফোর্ডেবল') || lower.includes('সাশ্রয়ী')) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            type: 'text',
            content: `আমাদের Affordable কালেকশনে ৮৫টিরও বেশি চমৎকার ডিজাইন রয়েছে! 🌸\nমূল্য: ৫০পিস ২,৭৫০৳ | ১০০পিস ৪,৫০০৳ | ২০০পিস ৭,০০০৳।\nনিচে স্লাইড করে ডিজাইনগুলো দেখুন: 👇`
          },
          { role: 'bot', type: 'carousel', category: 'affordable' }
        ]);
        setLoading(false);
        return;
      }

      // 2. Premium Carousel Request
      if (lower.includes('premium') || lower.includes('প্রিমিয়াম') || lower.includes('রাজকীয়')) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            type: 'text',
            content: `আমাদের Premium কালেকশনে ৮৩টিরও বেশি রাজকীয় গোল্ড ফয়েল ডিজাইন রয়েছে! ✨\nমূল্য: ৫০পিস ৩,২৫০৳ | ১০০পিস ৫,৫০০৳ | ২০০পিস ৯,০০০৳।\n🎁 ২০০+ পিসে ১টি প্রিমিয়াম নিকাহনামা ফ্রী!\nনিচে স্লাইড করে ডিজাইনগুলো দেখুন: 👇`
          },
          { role: 'bot', type: 'carousel', category: 'premium' }
        ]);
        setLoading(false);
        return;
      }

      // 3. Both Carousels / Photo Request
      if (['pic', 'picture', 'photo', 'ছবি', 'গ্যালারি', 'কার্ডের ছবি', 'ডিজাইন'].some(w => lower.includes(w))) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            type: 'text',
            content: `আমাদের সম্পূর্ণ বিয়ের কার্ডের গ্যালারি নিচে দেওয়া হলো! 🌸✨\nআঙুল দিয়ে স্লাইড করে সব ডিজাইন দেখতে পারেন: 👇`
          },
          { role: 'bot', type: 'carousel', category: 'affordable' },
          { role: 'bot', type: 'carousel', category: 'premium' }
        ]);
        setLoading(false);
        return;
      }

      // 4. Bangla Order Form Request
      if (lower.includes('বাংলা অর্ডার') || lower.includes('bangla form')) {
        setMessages(prev => [
          ...prev,
          { role: 'bot', type: 'form', title: '📝 বিয়ের কার্ডের বাংলা ফর্ম', formText: BANGLA_FORM_TEXT, id: 'bn_form' }
        ]);
        setLoading(false);
        return;
      }

      // 5. English Order Form Request
      if (lower.includes('english form') || lower.includes('ইংরেজি অর্ডার')) {
        setMessages(prev => [
          ...prev,
          { role: 'bot', type: 'form', title: '📝 Wedding Card English Form', formText: ENGLISH_FORM_TEXT, id: 'en_form' }
        ]);
        setLoading(false);
        return;
      }

      // 6. Delivery Policy Request
      if (lower.includes('পলিসি') || lower.includes('ডেলিভারি') || lower.includes('ঠিকানা') || lower.includes('অফিস')) {
        setMessages(prev => [
          ...prev,
          { role: 'bot', type: 'text', content: DELIVERY_POLICY_TEXT }
        ]);
        setLoading(false);
        return;
      }

      // 7. Free Nikahnama Offer Request
      if (lower.includes('নিকাহনামা') || lower.includes('অফার') || lower.includes('ফ্রি')) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            type: 'text',
            content: `🎁 **২০০ পিস বিয়ের কার্ড অর্ডারে ফ্রি নিকাহনামা অফার!**\n\n২০০ পিস যেকোনো বিয়ের কার্ড অর্ডার করলেই সাথে ১টি ল্যামিনেটেড প্রিমিয়াম নিকাহনামা সম্পূর্ণ ফ্রি দেওয়া হচ্ছে! 🥰\n\nঅর্ডার করতে "অর্ডার করব" বাটনে চাপুন বা হোয়াটসঅ্যাপে মেসেজ দিন: 01863586302 🌸`
          }
        ]);
        setLoading(false);
        return;
      }

      // 8. General Gemini / Fallback API request
      try {
        const history = messages
          .filter(m => m.type === 'text')
          .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...history, { role: 'user', content: userText }] })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'bot', type: 'text', content: data.reply }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'bot', type: 'text', content: 'আসসালামু আলাইকুম! BOONDHON Printing House-এ আপনাকে স্বাগতম। আপনি কোন তথ্যটি জানতে চান বলুন? 🥰 WhatsApp: 01863586302' }]);
      }
      setLoading(false);
    }, 250);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-brand-blue/30 bg-slate-950/95 backdrop-blur-2xl"
          style={{ height: '600px', maxHeight: '88vh' }}>

          {/* Header */}
          <div className="flex items-center gap-3 p-3.5 border-b border-white/10 bg-slate-900/90">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-white p-1 border-2 border-brand-blue shadow-lg flex items-center justify-center">
                <span className="text-xl">🌸</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <p className="text-white font-bold text-sm flex items-center gap-1">
                BOONDHON Printing House <span className="bg-brand-blue text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold">✓</span>
              </p>
              <p className="text-green-400 text-xs font-medium">অনন্যা (Sales Manager) • Online 😊</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-[10px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-full font-bold">⭐ 4.9 (5K+)</span>
              <button onClick={() => setOpen(false)} className="block ml-auto mt-1 text-gray-400 hover:text-white">
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Shimmer Offer Hook Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
            <span className="flex items-center gap-1.5">
              <span>🎁</span> ২০০ পিস কার্ড অর্ডারে ফ্রি নিকাহনামা!
            </span>
            <span className="bg-black/30 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-extrabold">LIMITED OFFER</span>
          </div>

          {/* Messages Container */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>

                {/* Standard Text Bubble */}
                {m.type === 'text' && (
                  <div className={`max-w-[86%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-2xl rounded-br-none shadow-lg font-medium' : 'bg-white text-slate-900 rounded-2xl rounded-bl-none shadow-md font-medium'}`}>
                    {m.content}
                  </div>
                )}

                {/* Swipable Image Carousel Card */}
                {m.type === 'carousel' && (
                  <ChatbotCarousel category={m.category} onImageClick={(url) => setLightboxImg(url)} />
                )}

                {/* Form Copy Bubble */}
                {m.type === 'form' && (
                  <div className="max-w-[92%] bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-brand-blue/30 space-y-3">
                    <h4 className="font-bold text-sm text-brand-blue">{m.title}</h4>
                    <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {m.formText}
                    </pre>
                    <button
                      onClick={() => handleCopy(m.id, m.formText)}
                      className="w-full bg-gradient-to-r from-brand-blue to-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95">
                      {copiedId === m.id ? <><Check size={14} /> ফর্ম কপি হয়েছে!</> : <><Copy size={14} /> 📋 ফর্ম কপি করুন</>}
                    </button>
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* High-Converting Quick Replies Bar */}
          <div className="p-2.5 border-t border-white/10 bg-slate-950 flex flex-wrap gap-1.5 justify-center">
            <button onClick={() => sendUserMessage('💚 Affordable Card')} className="text-xs bg-white text-brand-blue border border-brand-blue/40 px-3 py-1.5 rounded-full font-bold hover:bg-brand-blue hover:text-white transition-all shadow-sm">
              💚 Affordable Card
            </button>
            <button onClick={() => sendUserMessage('✨ Premium Card')} className="text-xs bg-white text-brand-gold border border-brand-gold/40 px-3 py-1.5 rounded-full font-bold hover:bg-brand-gold hover:text-black transition-all shadow-sm">
              ✨ Premium Card
            </button>
            <Link href="/order" onClick={() => setOpen(false)} className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white border border-amber-400 px-3 py-1.5 rounded-full font-bold hover:opacity-90 transition-all shadow-sm">
              💻 অনলাইনে অর্ডার করুন 🌸
            </Link>
            <button onClick={() => sendUserMessage('🎁 ফ্রি নিকাহনামা অফার')} className="text-xs bg-white/10 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full font-semibold hover:bg-white/20 transition-all">
              🎁 ফ্রি নিকাহনামা অফার
            </button>
            <button onClick={() => sendUserMessage('🚚 পলিসি ও ঠিকানা')} className="text-xs bg-white/10 text-gray-300 border border-white/15 px-2.5 py-1 rounded-full font-semibold hover:bg-white/20 transition-all">
              🚚 পলিসি ও ঠিকানা
            </button>
            <button onClick={() => sendUserMessage('বাংলা অর্ডার ফর্ম')} className="text-xs bg-white/10 text-gray-300 border border-white/15 px-2.5 py-1 rounded-full font-semibold hover:bg-white/20 transition-all">
              📝 বাংলা অর্ডার ফর্ম
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-white/10 bg-slate-900 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendUserMessage(input)}
              placeholder="অনন্যাকে মেসেজ লিখুন..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-brand-blue focus:outline-none transition-all"
            />
            <button onClick={() => sendUserMessage(input)}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-gradient-to-r from-brand-blue to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 shadow-lg">
              <Send size={16} className="text-white" />
            </button>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-950 px-4 py-1.5 border-t border-white/5 text-[11px] text-gray-400 text-center flex justify-between items-center">
            <span>📞 <a href="tel:01701016826" className="text-white font-bold hover:underline">01701016826</a></span>
            <span>bKash/Nagad 30% Advance: <strong>01682588856</strong></span>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxImg(null)} className="absolute -top-10 right-0 text-white text-2xl">✕</button>
            <img src={lightboxImg} alt="Card preview" className="w-full rounded-2xl shadow-2xl border border-white/20" />
            <Link href="/order" onClick={() => setLightboxImg(null)} className="mt-4 block w-full text-center bg-brand-blue text-white py-3 rounded-xl font-bold">
              এই ডিজাইনে অর্ডার করুন
            </Link>
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

// Subcomponent: Native Swipable Carousel inside Chatbot
function ChatbotCarousel({ category, onImageClick }) {
  const ids = category === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const label = category === 'premium' ? '✨ Premium Collection' : '💚 Affordable Collection';
  const [index, setIndex] = useState(0);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(ids.length - 1, i + 1));

  return (
    <div className="max-w-[92%] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs font-bold">
        <span className="text-brand-blue">{label}</span>
        <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full text-[10px]">
          {index + 1} / {ids.length}
        </span>
      </div>

      <div className="relative bg-slate-900">
        <img
          src={driveUrl(ids[index])}
          alt={`Design ${index + 1}`}
          className="w-full h-56 object-cover cursor-pointer"
          onClick={() => onImageClick(driveUrl(ids[index]))}
        />

        <button
          onClick={prev}
          disabled={index === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={next}
          disabled={index === ids.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="p-2.5 bg-slate-50 text-[11px] text-slate-600 text-center font-medium flex justify-between items-center">
        <span>👆 ছবি বড় করে দেখতে ট্যাপ করুন</span>
        <Link href={`/order?type=${category}`} className="text-brand-blue font-bold hover:underline">
          অর্ডার করুন →
        </Link>
      </div>
    </div>
  );
}
