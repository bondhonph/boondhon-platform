import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { 
  Phone, UserCheck, Bot, RefreshCw, Image as ImageIcon, Send, Clock, Zap, 
  AlertTriangle, Smartphone, Tag, CheckCircle2, Truck, CreditCard, UserPlus, CheckCheck,
  Search, MoreVertical, Paperclip, Smile
} from 'lucide-react';

const CRM_LABEL_COLORS = {
  'New Customer': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Follow-up': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Advance Paid': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Full Paid': 'bg-green-500/20 text-green-300 border-green-500/40',
  'Delivered': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
};

const CRM_LABEL_ICONS = {
  'New Customer': <UserPlus size={12} />,
  'Follow-up': <RefreshCw size={12} />,
  'Advance Paid': <CreditCard size={12} />,
  'Full Paid': <CheckCircle2 size={12} />,
  'Delivered': <Truck size={12} />
};

export default function ChatDashboard() {
  const router = useRouter();
  const { phone: queryPhone } = router.query;

  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [crmLabels, setCrmLabels] = useState(['New Customer', 'Follow-up', 'Advance Paid', 'Full Paid', 'Delivered']);
  const [messageText, setMessageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (queryPhone) {
      setSelectedPhone(queryPhone);
    }
  }, [queryPhone]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setQuickReplies(data.quickReplies || []);
        if (data.crmLabels) setCrmLabels(data.crmLabels);
        
        if (!selectedPhone && !queryPhone && data.conversations && data.conversations.length > 0) {
          setSelectedPhone(data.conversations[0].phone);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedPhone) {
        fetchActiveConversation(selectedPhone);
      }
    }, 2500);
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

  const handleUpdateLabel = async (newLabel) => {
    if (!selectedPhone) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_label',
          phone: selectedPhone,
          label: newLabel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error updating CRM label:', err);
    }
  };

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
      unreadCount: activeConv.unreadCount || 0,
      label: activeConv.label || 'New Customer'
    });
  }

  const filteredConvs = combinedConversations.filter(c => 
    c.phone.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Head>
        <title>BOONDHON Chat – WhatsApp Web Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-screen bg-[#0b141a] font-sans text-gray-100 flex flex-col">
        <Navbar />
        <div className="pt-16 flex-1 flex flex-col">
          {/* Header Banner */}
          <div className="border-b border-[#222d34] px-4 py-3 bg-[#111b21]">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 flex items-center justify-center text-[#25d366] font-bold text-lg">
                  💬
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    BOONDHON WhatsApp Web Live Chat
                  </h1>
                  <p className="text-gray-400 text-xs">Official WhatsApp Business Cloud API & Google Drive CRM</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstallApp}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg transition"
                >
                  <Smartphone size={15} />
                  <span>📲 অ্যান্ড্রয়েড অ্যাপ ইন্সটল করুন</span>
                </button>

                <button onClick={fetchConversations} className="p-2 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-gray-300 transition" title="Refresh data">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Main WhatsApp Web Container */}
          <div className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-4 flex flex-col">
            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400" />
                  <span><strong>ত্রুটি:</strong> {errorMessage}</span>
                </div>
                <button onClick={() => setErrorMessage('')} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded">
                  Dismiss
                </button>
              </div>
            )}

            {/* WhatsApp Web Split Panel */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#222d34] bg-[#111b21] shadow-2xl min-h-[640px]">
              
              {/* ── LEFT SIDEBAR (Chats List) ── */}
              <div className="lg:col-span-4 border-r border-[#222d34] flex flex-col bg-[#111b21]">
                {/* Search Bar */}
                <div className="p-3 border-b border-[#222d34] bg-[#111b21]">
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="ফোন নম্বর দিয়ে সার্চ করুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Conversation Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]">
                  {filteredConvs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      কোনো কাস্টমার চ্যাট পাওয়া যায়নি।<br/>হোয়াটসঅ্যাপে মেসেজ আসলে এখানে দেখা যাবে।
                    </div>
                  ) : (
                    filteredConvs.map((conv) => {
                      const isSelected = selectedPhone === conv.phone;
                      const remainingMins = getRemainingMinutes(conv.paused_until);
                      const labelText = conv.label || 'New Customer';
                      const badgeClass = CRM_LABEL_COLORS[labelText] || CRM_LABEL_COLORS['New Customer'];
                      const icon = CRM_LABEL_ICONS[labelText] || CRM_LABEL_ICONS['New Customer'];

                      return (
                        <div 
                          key={conv.phone}
                          onClick={() => setSelectedPhone(conv.phone)}
                          className={`p-3.5 cursor-pointer transition-all hover:bg-[#202c33] ${
                            isSelected ? 'bg-[#2a3942] border-l-4 border-[#00a884]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2a3942] text-gray-300 font-bold flex items-center justify-center text-sm border border-[#3b4a54]">
                              👤
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-semibold text-white text-sm truncate">
                                  {conv.name}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(conv.lastTimestamp)}</span>
                              </div>

                              <p className="text-gray-400 text-xs truncate mb-1.5">
                                {conv.lastMessage || 'মেসেজ শুরু হয়েছে'}
                              </p>

                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className={`px-2 py-0.5 rounded border text-[10px] font-medium flex items-center gap-1 ${badgeClass}`}>
                                  {icon}
                                  {labelText}
                                </span>

                                {conv.human_active ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium flex items-center gap-1">
                                    <UserCheck size={10} />
                                    Active ({remainingMins}m)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium flex items-center gap-1">
                                    <Bot size={10} />
                                    Bot Auto
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── RIGHT CHAT WINDOW (WhatsApp Web Style) ── */}
              <div className="lg:col-span-8 flex flex-col bg-[#0b141a] relative">
                {activeConv ? (
                  <>
                    {/* Active Chat Header */}
                    <div className="p-3 border-b border-[#222d34] bg-[#202c33] flex flex-wrap items-center justify-between gap-3 z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] font-bold flex items-center justify-center text-base">
                          📱
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white">
                              {activeConv.name}
                            </h2>

                            {/* Label Selector Dropdown */}
                            <div className="flex items-center gap-1 bg-[#111b21] border border-[#3b4a54] rounded-lg px-2 py-0.5">
                              <Tag size={12} className="text-[#00a884]" />
                              <select
                                value={activeConv.label || 'New Customer'}
                                onChange={(e) => handleUpdateLabel(e.target.value)}
                                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                              >
                                {crmLabels.map(l => (
                                  <option key={l} value={l} className="bg-[#111b21] text-white">
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#00a884]">
                            {activeConv.human_active ? 'Human Takeover Mode' : 'AI Bot Ananya Active'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeConv.human_active ? (
                          <button 
                            onClick={() => handleToggleBot(false)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1 transition"
                          >
                            <Bot size={14} />
                            Resume Bot Now
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleBot(true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1 transition"
                          >
                            <UserCheck size={14} />
                            Pause Bot (30m)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Messages Log with WhatsApp Wallpaper Background */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95">
                      {(!activeConv.messages || activeConv.messages.length === 0) ? (
                        <div className="text-center text-gray-500 text-xs py-16">
                          কাস্টমারের সাথে বার্তা বিনিময় শুরু হলে এখানে হোয়াটসঅ্যাপের মতো চ্যাট দেখা যাবে।
                        </div>
                      ) : (
                        activeConv.messages.map((msg, i) => {
                          const isCustomer = msg.sender === 'customer';
                          const isAgent = msg.sender === 'agent';
                          const isBot = msg.sender === 'bot';

                          return (
                            <div key={i} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                              <div className={`max-w-[85%] md:max-w-[70%] rounded-xl p-3 text-xs shadow-lg relative ${
                                isCustomer 
                                  ? 'bg-[#202c33] text-gray-100 rounded-tl-none border border-[#2a3942]' 
                                  : isAgent 
                                    ? 'bg-[#005c4b] text-white rounded-tr-none border border-[#007a63]'
                                    : 'bg-[#025144] text-emerald-100 rounded-tr-none border border-[#006857]'
                              }`}>
                                <div className="text-[10px] font-bold opacity-80 mb-1 flex items-center justify-between gap-2">
                                  {isCustomer && <span className="text-emerald-400">👤 Customer (+{activeConv.phone})</span>}
                                  {isAgent && <span className="text-amber-300 flex items-center gap-1"><UserCheck size={10} /> You (Human Agent)</span>}
                                  {isBot && <span className="text-blue-300 flex items-center gap-1"><Bot size={10} /> Ananya AI Bot</span>}
                                </div>

                                {msg.text && <p className="whitespace-pre-line leading-relaxed text-xs">{msg.text}</p>}

                                {msg.image && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-black/20">
                                    <img src={msg.image} alt="WhatsApp Image" className="max-h-56 object-cover w-full" />
                                  </div>
                                )}

                                <div className="text-[9px] text-gray-300 flex items-center justify-end gap-1 mt-1 opacity-75">
                                  <span>{formatTime(msg.timestamp)}</span>
                                  {!isCustomer && <CheckCheck size={12} className="text-[#53bdeb]" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Reply Shortcuts Bar */}
                    <div className="px-3 py-2 bg-[#111b21] border-t border-[#222d34] flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                        <Zap size={14} />
                        Quick Reply:
                      </span>
                      {quickReplies.map((qr) => (
                        <button
                          key={qr.id}
                          disabled={sending}
                          onClick={() => handleSendQuickReply(qr.id)}
                          className="px-3 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] border border-[#3b4a54] text-xs text-gray-200 whitespace-nowrap transition flex items-center gap-1"
                        >
                          {qr.title}
                        </button>
                      ))}
                    </div>

                    {/* WhatsApp Style Message Input Bar */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222d34] bg-[#202c33]">
                      {showImageInput && (
                        <div className="mb-2 flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="ছবির লিংক (Image URL) দিন..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-1 bg-[#111b21] border border-[#3b4a54] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a884]"
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
                          className={`p-2.5 rounded-full transition ${
                            imageUrl ? 'bg-[#00a884] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a3942]'
                          }`}
                          title="ছবি পাঠাতে লিংক যোগ করুন"
                        >
                          <ImageIcon size={20} />
                        </button>

                        <input
                          type="text"
                          placeholder="মেসেজ লিখুন..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1 bg-[#2a3942] border border-transparent rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00a884]"
                        />

                        <button
                          type="submit"
                          disabled={sending || (!messageText.trim() && !imageUrl.trim())}
                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f70] text-white flex items-center justify-center disabled:opacity-50 transition shadow-md"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-[#202c33] text-[#00a884] font-bold flex items-center justify-center text-2xl mb-3">
                      💬
                    </div>
                    <h3 className="text-white text-base font-semibold mb-1">BOONDHON WhatsApp Web Dashboard</h3>
                    <p className="text-xs text-gray-400 max-w-sm">
                      বাম পাশের কাস্টমার চ্যাট তালিকা থেকে যেকোনো নম্বর নির্বাচন করে হোয়াটসঅ্যাপের মতো চ্যাট করুন।
                    </p>
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
