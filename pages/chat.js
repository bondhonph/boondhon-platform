import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { Phone, UserCheck, Bot, RefreshCw, Image as ImageIcon, Send, Clock, Zap, AlertTriangle, Smartphone } from 'lucide-react';

export default function ChatDashboard() {
  const router = useRouter();
  const { phone: queryPhone } = router.query;

  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const messagesEndRef = useRef(null);

  // Listen for PWA install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('অ্যাপটি ইন্সটল করতে ক্রোম ব্রাউজারের উপরে থাকা ৩টি ডটে (...) ক্লিক করে "Add to Home screen" বা "Install app" অপশনে চাপুন।');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Auto-select phone from URL query param if present
  useEffect(() => {
    if (queryPhone) {
      setSelectedPhone(queryPhone);
    }
  }, [queryPhone]);

  // Fetch all conversations list
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setQuickReplies(data.quickReplies || []);
        
        if (!selectedPhone && !queryPhone && data.conversations && data.conversations.length > 0) {
          setSelectedPhone(data.conversations[0].phone);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Fetch active conversation detail
  const fetchActiveConversation = async (phone) => {
    if (!phone) return;
    try {
      const res = await fetch(`/api/conversations?phone=${phone}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
      }
    } catch (err) {
      console.error('Error fetching conversation detail:', err);
    }
  };

  // Polling for live chat updates every 3 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedPhone) {
        fetchActiveConversation(selectedPhone);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedPhone]);

  useEffect(() => {
    if (selectedPhone) {
      fetchActiveConversation(selectedPhone);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Handle Manual Message Send
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!messageText.trim() && !imageUrl.trim()) || !selectedPhone || sending) return;

    setSending(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          phone: selectedPhone,
          text: messageText,
          imageUrl: imageUrl
        })
      });

      const data = await res.json();

      if (res.ok) {
        setActiveConv(data.conversation);
        setMessageText('');
        setImageUrl('');
        setShowImageInput(false);
        fetchConversations();
      } else {
        setErrorMessage(data.error || 'Failed to send message via WhatsApp API');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  // Handle Toggle Human Takeover / Resume Bot
  const handleToggleBot = async (newActiveState) => {
    if (!selectedPhone) return;
    setErrorMessage('');
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_bot',
          phone: selectedPhone,
          active: newActiveState,
          pauseDuration: 30
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error toggling takeover:', err);
    }
  };

  // Handle Quick Reply Shortcut Send
  const handleSendQuickReply = async (qrId) => {
    if (!selectedPhone || sending) return;
    setSending(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_quick_reply',
          phone: selectedPhone,
          quickReplyId: qrId,
          pauseDuration: 30
        })
      });

      const data = await res.json();

      if (res.ok) {
        setActiveConv(data.conversation);
        fetchConversations();
      } else {
        setErrorMessage(data.error || 'Failed to send quick reply via WhatsApp API');
      }
    } catch (err) {
      console.error('Error sending quick reply:', err);
      setErrorMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRemainingMinutes = (pausedUntil) => {
    if (!pausedUntil) return 0;
    const diff = pausedUntil - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60)));
  };

  const combinedConversations = [...conversations];
  if (activeConv && activeConv.phone && !combinedConversations.some(c => c.phone === activeConv.phone)) {
    combinedConversations.unshift({
      phone: activeConv.phone,
      name: activeConv.name || `+${activeConv.phone}`,
      lastMessage: activeConv.lastMessage || 'মেসেজ সচল আছে',
      lastTimestamp: activeConv.lastTimestamp || Date.now(),
      human_active: activeConv.human_active,
      paused_until: activeConv.paused_until,
      unreadCount: activeConv.unreadCount || 0
    });
  }

  const filteredConvs = combinedConversations.filter(c => 
    c.phone.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Head>
        <title>BOONDHON Chat – Android App & Live Messaging</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-screen bg-brand-dark font-sans text-gray-100">
        <Navbar />
        <div className="pt-20 min-h-screen">
          <div className="border-b border-brand-blue/10 px-4 py-4 bg-brand-dark/80 backdrop-blur">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
                  💬 BOONDHON Live Chat & Support
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">WhatsApp Business Cloud API Live Messaging Center</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstallApp}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg transition animate-pulse"
                  title="মোবাইলে অ্যান্ড্রয়েড অ্যাপ হিসেবে ইন্সটল করুন"
                >
                  <Smartphone size={15} />
                  <span>📲 অ্যান্ড্রয়েড অ্যাপ ইন্সটল করুন</span>
                </button>

                <button onClick={fetchConversations} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition" title="Refresh data">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6">
            {errorMessage && (
              <div className="mb-4 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-400" />
                  <span><strong>মেসেজ পাঠানো যায়নি:</strong> {errorMessage}</span>
                </div>
                <button onClick={() => setErrorMessage('')} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg">
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px] lg:h-[720px]">
              <div className="lg:col-span-4 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 bg-brand-dark/40">
                <div className="p-4 border-b border-white/10 bg-white/3">
                  <input 
                    type="text" 
                    placeholder="ফোন নম্বর দিয়ে সার্চ করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {filteredConvs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      কোনো চ্যাট হিস্ট্রি পাওয়া যায়নি।<br/>হোয়াটসঅ্যাপে মেসেজ আসলে এখানে ভেসে উঠবে।
                    </div>
                  ) : (
                    filteredConvs.map((conv) => {
                      const isSelected = selectedPhone === conv.phone;
                      const remainingMins = getRemainingMinutes(conv.paused_until);

                      return (
                        <div 
                          key={conv.phone}
                          onClick={() => setSelectedPhone(conv.phone)}
                          className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                            isSelected ? 'bg-brand-blue/15 border-l-4 border-brand-blue' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-white text-sm flex items-center gap-1.5">
                              {conv.name}
                            </span>
                            <span className="text-[11px] text-gray-500">{formatTime(conv.lastTimestamp)}</span>
                          </div>

                          <p className="text-gray-400 text-xs truncate mb-2">
                            {conv.lastMessage || 'মেসেজ শুরু হয়েছে'}
                          </p>

                          <div className="flex items-center justify-between text-[11px]">
                            {conv.human_active ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                                <UserCheck size={12} />
                                Agent Active ({remainingMins}m)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-brand-blue font-medium border border-brand-blue/20 flex items-center gap-1">
                                <Bot size={12} />
                                Bot Auto-Reply
                              </span>
                            )}

                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold text-[10px]">
                                {conv.unreadCount} New
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 bg-brand-dark/40">
                {activeConv ? (
                  <>
                    <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Phone size={18} className="text-brand-blue" />
                          {activeConv.name}
                        </h2>
                        <p className="text-xs text-gray-400">WhatsApp Customer Session</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {activeConv.human_active ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                              <Clock size={14} />
                              Auto-resume in {getRemainingMinutes(activeConv.paused_until)}m
                            </span>
                            <button 
                              onClick={() => handleToggleBot(false)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition"
                            >
                              <Bot size={14} />
                              Resume Bot Now
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleToggleBot(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition"
                          >
                            <UserCheck size={14} />
                            Take Over Chat (Pause Bot 30m)
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-brand-dark/60">
                      {(!activeConv.messages || activeConv.messages.length === 0) ? (
                        <div className="text-center text-gray-500 text-sm py-12">
                          এই কাস্টমারের সাথে কথোপকথন এখান থেকে দেখা যাবে।
                        </div>
                      ) : (
                        activeConv.messages.map((msg, i) => {
                          const isCustomer = msg.sender === 'customer';
                          const isAgent = msg.sender === 'agent';
                          const isBot = msg.sender === 'bot';

                          return (
                            <div key={i} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 text-sm shadow-md ${
                                isCustomer 
                                  ? 'bg-white/10 text-white rounded-tl-none border border-white/10' 
                                  : isAgent 
                                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-tr-none'
                                    : 'bg-brand-blue/20 border border-brand-blue/30 text-blue-100 rounded-tr-none'
                              }`}>
                                <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center gap-1">
                                  {isCustomer && <span>👤 Customer</span>}
                                  {isAgent && <span className="text-amber-400 flex items-center gap-1"><UserCheck size={10} /> You (Human Agent)</span>}
                                  {isBot && <span className="text-brand-blue flex items-center gap-1"><Bot size={10} /> Ananya (AI Bot)</span>}
                                </div>

                                {msg.text && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}

                                {msg.image && (
                                  <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                                    <img src={msg.image} alt="WhatsApp Media" className="max-h-48 object-cover w-full" />
                                  </div>
                                )}

                                <div className="text-[10px] text-gray-400 text-right mt-1 opacity-70">
                                  {formatTime(msg.timestamp)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                        <Zap size={14} className="text-brand-gold" />
                        Quick Reply Shortcuts:
                      </span>
                      {quickReplies.map((qr) => (
                        <button
                          key={qr.id}
                          disabled={sending}
                          onClick={() => handleSendQuickReply(qr.id)}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium whitespace-nowrap transition flex items-center gap-1"
                        >
                          {qr.title}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-brand-dark/80">
                      {showImageInput && (
                        <div className="mb-2 flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="ছবির সরাসরি লিঙ্ক (Image URL) দিন..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-blue"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowImageInput(false)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImageInput(!showImageInput)}
                          className={`p-2.5 rounded-xl border transition ${
                            imageUrl ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                          }`}
                          title="ছবি যোগ করুন"
                        >
                          <ImageIcon size={18} />
                        </button>

                        <input
                          type="text"
                          placeholder="হোয়াটসঅ্যাপে ম্যানুয়াল উত্তর লিখুন..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue"
                        />

                        <button
                          type="submit"
                          disabled={sending || (!messageText.trim() && !imageUrl.trim())}
                          className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50 transition"
                        >
                          <Send size={16} />
                          {sending ? 'পাঠানো হচ্ছে...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
                    বাম পাশের তালিকা থেকে একটি হোয়াটসঅ্যাপ চ্যাট বেছে নিন।
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
