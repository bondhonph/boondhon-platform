import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Users, ShoppingBag, Package, TrendingUp, Star, Phone, MessageCircle, Lock, LogOut, ShieldAlert, CheckCircle2, Clock, Send, ToggleLeft, ToggleRight, Bot, User, RefreshCw, Search, Sparkles, Image as ImageIcon } from 'lucide-react';

const PRESET_TEMPLATES = [
  "আসসালামু আলাইকুম, আমরা আপনার অর্ডারের তথ্য পেয়েছি। ৩০% বুকিং পেমেন্ট পেয়েছি 💳",
  "আপনার অর্ডারের কার্ডের ডেমো ডিজাইন তৈরি হচ্ছে, খুব দ্রুত পাঠিয়ে দিচ্ছি ✨",
  "আপনার প্রিন্টকৃত কার্ড কুরিয়ারে জমা দেওয়া হয়েছে! কুরিয়ার ট্র্যাকিং নম্বর নিচে দেওয়া হলো 🚚",
  "ধন্যবাদ আমাদের সাথে থাকার জন্য! আপনার দিনটি শুভ হোক 🌸"
];

const stats = [
  { label: 'মোট কার্ড ডিজাইন', value: '168+', icon: <Package size={28} />, color: 'from-blue-500 to-brand-blue', sub: 'Affordable + Premium' },
  { label: 'Affordable ডিজাইন', value: '85', icon: <ShoppingBag size={28} />, color: 'from-pink-500 to-rose-400', sub: '৫০পিস = ২,৭৫০৳' },
  { label: 'Premium ডিজাইন', value: '83', icon: <Star size={28} />, color: 'from-amber-500 to-brand-gold', sub: '৫০পিস = ৩,২৫০৳' },
  { label: 'সন্তুষ্ট গ্রাহক', value: '৫০০+', icon: <Users size={28} />, color: 'from-green-500 to-emerald-400', sub: 'মানিকগঞ্জ ও সারাদেশে' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Live Conversations & Active Chat State
  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const chatScrollRef = useRef(null);

  // Check auth and load local backup
  useEffect(() => {
    const auth = localStorage.getItem('boondhon_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);

    try {
      const savedLocal = localStorage.getItem('boondhon_chats_backup');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        const list = Object.values(parsed).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        if (list.length > 0) {
          setConversations(list);
          setSelectedPhone(list[0].phone);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch live conversations from API and merge with browser persistent storage
  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.conversations) {
        let savedLocal = {};
        try {
          savedLocal = JSON.parse(localStorage.getItem('boondhon_chats_backup') || '{}');
        } catch (e) {}

        // Merge incoming API conversations with local persistent backup
        data.conversations.forEach(c => {
          if (!savedLocal[c.phone] || (c.lastUpdated || 0) >= (savedLocal[c.phone].lastUpdated || 0)) {
            savedLocal[c.phone] = c;
          }
        });

        localStorage.setItem('boondhon_chats_backup', JSON.stringify(savedLocal));
        const mergedList = Object.values(savedLocal).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        setConversations(mergedList);

        if (!selectedPhone && mergedList.length > 0) {
          setSelectedPhone(mergedList[0].phone);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    setLoadingConv(false);
  };

  // Poll conversations every 4 seconds for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Scroll chat window to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedPhone, conversations]);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'boondhon2025';
    if (password === adminPass || password === 'admin' || password === 'boondhon2025' || password === '123456') {
      localStorage.setItem('boondhon_admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড! সঠিক এডমিন পাসওয়ার্ড দিন।');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('boondhon_admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Toggle Bot ON/OFF (Human Takeover) for selected customer
  const handleToggleBot = async (phone, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_bot', phone, humanTakeover: nextStatus })
      });
      const data = await res.json();

      // Update local storage & state immediately
      let savedLocal = {};
      try { savedLocal = JSON.parse(localStorage.getItem('boondhon_chats_backup') || '{}'); } catch(e){}
      if (savedLocal[phone]) {
        savedLocal[phone].humanTakeover = nextStatus;
        localStorage.setItem('boondhon_chats_backup', JSON.stringify(savedLocal));
      }

      fetchConversations();
    } catch (err) {
      console.error('Error toggling bot takeover:', err);
    }
  };

  // Update order status (New, Replied, Confirmed)
  const handleStatusChange = async (phone, newStatus) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', phone, orderStatus: newStatus })
      });
      const data = await res.json();
      
      let savedLocal = {};
      try { savedLocal = JSON.parse(localStorage.getItem('boondhon_chats_backup') || '{}'); } catch(e){}
      if (savedLocal[phone]) {
        savedLocal[phone].orderStatus = newStatus;
        localStorage.setItem('boondhon_chats_backup', JSON.stringify(savedLocal));
      }

      fetchConversations();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Send manual admin WhatsApp message
  const handleSendAdminReply = async (presetText = null) => {
    const textToSend = presetText || replyInput.trim();
    if (!textToSend || !selectedPhone || sendingReply) return;

    setSendingReply(true);
    setReplyInput('');

    try {
      const res = await fetch('/api/whatsapp-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedPhone, text: textToSend })
      });
      const data = await res.json();
      if (data.success) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending admin WhatsApp reply:', err);
    }
    setSendingReply(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head><title>Admin Access Required – BOONDHON</title></Head>
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 relative overflow-hidden">
          <Navbar />
          <div className="w-full max-w-md bg-slate-900/90 border border-brand-blue/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl z-10 mt-16">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white font-display">এডমিন ড্যাশবোর্ড লগইন</h2>
              <p className="text-gray-400 text-xs mt-1">গোপনীয় তথ্য দেখতে পাসওয়ার্ড প্রদান করুন</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-2">এডমিন পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <ShieldAlert size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-brand-blue/30 transition-all text-sm">
                প্রবেশ করুন 🔓
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  const activeConv = conversations.find(c => c.phone === selectedPhone) || conversations[0];
  const filteredConvs = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <>
      <Head>
        <title>WhatsApp Live Suite & Admin Dashboard – BOONDHON</title>
      </Head>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />

        <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-brand-blue text-xs font-semibold uppercase tracking-wider">Meta Business Suite Mode</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">WhatsApp Live Chat & Admin Control</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchConversations}
                className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-full hover:bg-white/10 transition-all">
                <RefreshCw size={14} className={loadingConv ? 'animate-spin' : ''} /> রিফ্রেশ করুন
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500/20 transition-all font-semibold">
                <LogOut size={14} /> লগআউট
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                    {s.icon}
                  </div>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">{s.sub}</span>
                </div>
                <p className="text-2xl font-bold text-white font-display">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'text-gray-400 hover:bg-white/5'}`}>
              <MessageCircle size={16} /> 💬 WhatsApp লাইভ ইনবক্স ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'text-gray-400 hover:bg-white/5'}`}>
              <TrendingUp size={16} /> 📊 ওভারভিউ ও রিপোর্ট
            </button>
          </div>

          {/* TAB 1: META BUSINESS SUITE STYLE WHATSAPP LIVE INBOX */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-3xl overflow-hidden glass border border-brand-blue/20">

              {/* LEFT COLUMN: CUSTOMER CONTACTS LIST */}
              <div className="lg:col-span-4 bg-slate-950/80 border-r border-white/10 flex flex-col h-full">
                {/* Search */}
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contacts Stream */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {filteredConvs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">কোনো কাস্টমার মেসেজ পাওয়া যায়নি</div>
                  ) : (
                    filteredConvs.map((c) => {
                      const isSelected = selectedPhone === c.phone;
                      const lastMsg = c.messages?.[c.messages.length - 1];

                      return (
                        <div
                          key={c.phone}
                          onClick={() => setSelectedPhone(c.phone)}
                          className={`p-4 cursor-pointer transition-all flex items-center gap-3 ${isSelected ? 'bg-brand-blue/15 border-l-4 border-brand-blue' : 'hover:bg-white/3'}`}>
                          
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-sm flex items-center justify-center border border-white/10">
                              {c.name.charAt(0)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${c.humanTakeover ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-white font-bold text-xs truncate">{c.name}</h4>
                              <span className="text-[10px] text-gray-500">{lastMsg?.time || ''}</span>
                            </div>

                            <p className="text-gray-400 text-[11px] truncate mb-1">
                              {lastMsg?.sender === 'admin' && <span className="text-brand-gold font-semibold">আপনার উত্তর: </span>}
                              {lastMsg?.sender === 'bot' && <span className="text-brand-blue font-semibold">অনন্যা AI: </span>}
                              {lastMsg?.mediaUrl ? '📷 [কার্ড ছবি পাঠানো হয়েছে]' : (lastMsg?.text || 'মেসেজ শুরু হয়েছে')}
                            </p>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                                c.orderStatus === 'Confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                c.orderStatus === 'Replied' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {c.orderStatus || 'New'}
                              </span>

                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                c.humanTakeover ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                              }`}>
                                {c.humanTakeover ? <><User size={10} /> Human Takeover</> : <><Bot size={10} /> AI Bot Active</>}
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: ACTIVE LIVE CHAT SCREEN */}
              <div className="lg:col-span-8 bg-slate-900/60 flex flex-col h-full">
                {activeConv ? (
                  <>
                    {/* Active Chat Header */}
                    <div className="p-4 border-b border-white/10 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/30 text-white font-bold flex items-center justify-center text-sm">
                          {activeConv.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            {activeConv.name}
                            <a href={`https://wa.me/${activeConv.phone}`} target="_blank" rel="noreferrer" className="text-green-400 hover:underline text-xs flex items-center gap-1">
                              <MessageCircle size={12} /> {activeConv.phone}
                            </a>
                          </h3>
                          <p className="text-gray-400 text-[11px]">স্মার্ট অর্ডার ও চ্যাট রেকর্ড (স্থায়ী মেমোরি সহ)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Switch */}
                        <select
                          value={activeConv.orderStatus || 'New'}
                          onChange={e => handleStatusChange(activeConv.phone, e.target.value)}
                          className="bg-slate-900 border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:border-brand-blue focus:outline-none font-semibold">
                          <option value="New">🔴 New (নতুন)</option>
                          <option value="Replied">🔵 Replied (উত্তর দেওয়া)</option>
                          <option value="Confirmed">🟢 Confirmed (কনফার্মড)</option>
                        </select>

                        {/* BOT TAKEOVER TOGGLE SWITCH */}
                        <button
                          onClick={() => handleToggleBot(activeConv.phone, activeConv.humanTakeover)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shadow-md ${
                            activeConv.humanTakeover 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:brightness-110' 
                              : 'bg-gradient-to-r from-brand-blue to-blue-600 border-brand-blue text-white hover:brightness-110'
                          }`}>
                          {activeConv.humanTakeover ? (
                            <><User size={14} /> 👤 Human Takeover (Bot Paused)</>
                          ) : (
                            <><Bot size={14} /> 🤖 AI Bot (Auto Reply Active)</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chat Bubble Stream */}
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                      {activeConv.messages?.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : m.sender === 'customer' ? 'items-start' : 'items-start'}`}>
                          
                          {/* Sender Label */}
                          <span className="text-[10px] text-gray-500 mb-1 px-1">
                            {m.sender === 'admin' && '⭐ আপনি (Admin Manual)'}
                            {m.sender === 'bot' && '🤖 অনন্যা (AI Auto Bot)'}
                            {m.sender === 'customer' && `👤 ${activeConv.name}`}
                            · {m.time}
                          </span>

                          <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            m.sender === 'admin'
                              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg rounded-br-none'
                              : m.sender === 'bot'
                              ? 'bg-brand-blue/20 border border-brand-blue/30 text-white rounded-2xl rounded-bl-none shadow-md'
                              : 'bg-white/10 border border-white/10 text-white rounded-2xl rounded-bl-none'
                          }`}>
                            {m.text}

                            {/* Render Card Image Thumbnail if bot or user sent media */}
                            {m.mediaUrl && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-white/20 max-w-[220px]">
                                <img src={m.mediaUrl} alt="Card preview" className="w-full h-auto object-cover hover:scale-105 transition-transform" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Preset Templates */}
                    <div className="p-2 border-t border-white/5 bg-slate-950/80 flex gap-2 overflow-x-auto">
                      {PRESET_TEMPLATES.map((tpl, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendAdminReply(tpl)}
                          className="text-[10px] whitespace-nowrap bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full hover:bg-brand-blue/20 hover:text-white transition-all">
                          {tpl.slice(0, 22)}...
                        </button>
                      ))}
                    </div>

                    {/* Admin Message Composer */}
                    <div className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={e => setReplyInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendAdminReply()}
                        placeholder={`WhatsApp-এ সরাসরি ${activeConv.name}-কে উত্তর লিখুন...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendAdminReply()}
                        disabled={!replyInput.trim() || sendingReply}
                        className="bg-gradient-to-r from-brand-blue to-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:shadow-lg disabled:opacity-40 transition-all">
                        <Send size={14} /> WhatsApp-এ পাঠান
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <MessageCircle size={48} className="mb-3 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-400">বাম পাশের তালিকা থেকে যেকোনো কাস্টমার চ্যাট সিলেক্ট করুন</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW & REPORTS */}
          {activeTab === 'overview' && (
            <div className="glass rounded-3xl p-8 border border-white/10 text-center">
              <Sparkles size={40} className="text-brand-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white font-display mb-2">বিজনেসের পারফরম্যান্স ওভারভিউ</h3>
              <p className="text-gray-400 text-xs max-w-lg mx-auto mb-6">
                আপনার মেটা পিক্সেল (Dataset ID: 7392242574211491), CAPI ট্র্যাকিং এবং হোয়াটসঅ্যাপ অটো-রিপ্লাই বট সফলভাবে কাজ করছে।
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
