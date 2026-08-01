import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Users, ShoppingBag, Package, Star, Phone, MessageCircle, Facebook, Send, UserCheck, Bot, RefreshCw, Image as ImageIcon, CheckCircle, Clock, ShieldAlert, Zap } from 'lucide-react';

const stats = [
  { label: 'মোট কার্ড ডিজাইন', value: '168+', icon: <Package size={28} />, color: 'from-blue-500 to-brand-blue', sub: 'Affordable + Premium' },
  { label: 'Affordable ডিজাইন', value: '85', icon: <ShoppingBag size={28} />, color: 'from-pink-500 to-rose-400', sub: '৫০পিস = ২,৭৫০৳' },
  { label: 'Premium ডিজাইন', value: '83', icon: <Star size={28} />, color: 'from-amber-500 to-brand-gold', sub: '৫০পিস = ৩,২৫০৳' },
  { label: 'সন্তুষ্ট গ্রাহক', value: '৫০০+', icon: <Users size={28} />, color: 'from-green-500 to-emerald-400', sub: 'মানিকগঞ্জ ও সারাদেশে' },
];

const pricingData = [
  { pcs: '৫০ পিস', aff: '২,৭৫০৳', pre: '৩,২৫০৳', perAff: '৫৫৳/পিস', perPre: '৬৫৳/পিস' },
  { pcs: '১০০ পিস', aff: '৪,৫০০৳', pre: '৫,৫০০৳', perAff: '৪৫৳/পিস', perPre: '৫৫৳/পিস' },
  { pcs: '২০০ পিস', aff: '৭,০০০৳', pre: '৯,০০০৳', perAff: '৩৫৳/পিস', perPre: '৪৫৳/পিস' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('livechat');
  
  // Live Chat & Takeover State
  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch all conversations list
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setQuickReplies(data.quickReplies || []);
        
        // Auto select first conversation if none selected
        if (!selectedPhone && data.conversations && data.conversations.length > 0) {
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

  // Polling for live chat updates every 3.5 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedPhone) {
        fetchActiveConversation(selectedPhone);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedPhone]);

  // Fetch selected conversation when selectedPhone changes
  useEffect(() => {
    if (selectedPhone) {
      fetchActiveConversation(selectedPhone);
    }
  }, [selectedPhone]);

  // Scroll to bottom of chat when activeConv messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Handle Manual Message Send
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!messageText.trim() && !imageUrl.trim()) || !selectedPhone || sending) return;

    setSending(true);
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

      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        setMessageText('');
        setImageUrl('');
        setShowImageInput(false);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle Toggle Human Takeover / Resume Bot
  const handleToggleBot = async (newActiveState) => {
    if (!selectedPhone) return;
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

      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending quick reply:', err);
    } finally {
      setSending(false);
    }
  };

  // Helper for formatting timestamps
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper for remaining takeover minutes
  const getRemainingMinutes = (pausedUntil) => {
    if (!pausedUntil) return 0;
    const diff = pausedUntil - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60)));
  };

  const filteredConvs = conversations.filter(c => 
    c.phone.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Head><title>Dashboard & Human Takeover – BOONDHON Printing House</title></Head>
      <div className="min-h-screen bg-brand-dark font-sans text-gray-100">
        <Navbar />
        <div className="pt-20 min-h-screen">
          {/* Header */}
          <div className="border-b border-brand-blue/10 px-4 py-4 bg-brand-dark/80 backdrop-blur">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  BOONDHON Admin Control Center
                </h1>
                <p className="text-gray-400 text-sm">WhatsApp Business Cloud API Live Management — Manikganj</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchConversations} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition" title="Refresh data">
                  <RefreshCw size={16} />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-xs font-semibold">WhatsApp Bot Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/5 pb-3">
              {[
                ['livechat', '💬 লাইভ চ্যাট & টেকওভার', true],
                ['overview', 'Overview Stats'],
                ['pricing', 'মূল্য তালিকা'],
                ['contact', 'যোগাযোগ ও তথ্য']
              ].map(([v, label, isBadge]) => (
                <button key={v} onClick={() => setActiveTab(v)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === v 
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                      : 'text-gray-400 hover:text-white bg-white/3 hover:bg-white/5'
                  }`}>
                  {label}
                  {isBadge && conversations.some(c => c.unreadCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB 1: LIVE CHAT & HUMAN TAKEOVER DASHBOARD */}
            {activeTab === 'livechat' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
                
                {/* LEFT SIDEBAR: Conversations List */}
                <div className="lg:col-span-4 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 bg-brand-dark/40">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-white/10 bg-white/3">
                    <input 
                      type="text" 
                      placeholder="ফোন নম্বর দিয়ে সার্চ করুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  {/* Conversation List Items */}
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

                            {/* Status Badge */}
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

                {/* RIGHT SIDE: Active Conversation Chat & Control Window */}
                <div className="lg:col-span-8 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 bg-brand-dark/40">
                  {activeConv ? (
                    <>
                      {/* CHAT HEADER & TAKEOVER CONTROL BAR */}
                      <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Phone size={18} className="text-brand-blue" />
                            {activeConv.name}
                          </h2>
                          <p className="text-xs text-gray-400">WhatsApp Customer Session</p>
                        </div>

                        {/* Human Takeover Toggle Switch / Resume Button */}
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

                      {/* MESSAGES HISTORY AREA */}
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
                                <div className={`max-w-[75%] rounded-2xl p-3.5 text-sm shadow-md ${
                                  isCustomer 
                                    ? 'bg-white/10 text-white rounded-tl-none border border-white/10' 
                                    : isAgent 
                                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-tr-none'
                                      : 'bg-brand-blue/20 border border-brand-blue/30 text-blue-100 rounded-tr-none'
                                }`}>
                                  
                                  {/* Sender Label */}
                                  <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center gap-1">
                                    {isCustomer && <span>👤 Customer</span>}
                                    {isAgent && <span className="text-amber-400 flex items-center gap-1"><UserCheck size={10} /> You (Human Agent)</span>}
                                    {isBot && <span className="text-brand-blue flex items-center gap-1"><Bot size={10} /> Ananya (AI Bot)</span>}
                                  </div>

                                  {/* Text Content */}
                                  {msg.text && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}

                                  {/* Image Media Preview */}
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

                      {/* QUICK REPLIES SHORTCUT BAR */}
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

                      {/* INPUT REPLY BOX */}
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
                            placeholder="হোয়াটসঅ্যাপে ম্যানুয়াল উত্তর লিখুন (উত্তর দিলে অটোমেটিক ৩০মিনিট বট পজ হবে)..."
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
            )}

            {/* TAB 2: OVERVIEW STATS */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {stats.map((s, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${s.color} bg-opacity-20`}
                      style={{ background: `linear-gradient(135deg, rgba(41,171,226,0.12), rgba(10,22,40,0.8))`, border: '1px solid rgba(41,171,226,0.15)' }}>
                      <div className="text-brand-blue mb-3">{s.icon}</div>
                      <p className="text-4xl font-bold text-white mb-1">{s.value}</p>
                      <p className="text-white font-medium text-sm">{s.label}</p>
                      <p className="text-gray-400 text-xs mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-6">কার্ড ক্যাটাগরি ডিস্ট্রিবিউশন</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Affordable কার্ড', pct: 51, color: 'bg-brand-blue', count: 85 },
                        { label: 'Premium কার্ড', pct: 49, color: 'bg-brand-gold', count: 83 },
                      ].map((b, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{b.label}</span>
                            <span className="text-gray-400">{b.count} ডিজাইন ({b.pct}%)</span>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${b.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-6">পেমেন্ট পদ্ধতি</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'bKash', color: 'text-pink-400 bg-pink-400/10', pct: 60 },
                        { name: 'Nagad', color: 'text-orange-400 bg-orange-400/10', pct: 25 },
                        { name: 'Rocket', color: 'text-purple-400 bg-purple-400/10', pct: 15 },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full w-16 text-center ${p.color}`}>{p.name}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue/60 rounded-full" style={{ width: `${p.pct}%` }}></div>
                          </div>
                          <span className="text-gray-400 text-xs w-8">{p.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: PRICING */}
            {activeTab === 'pricing' && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-white font-semibold text-lg">সম্পূর্ণ মূল্য তালিকা</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-gray-400 text-sm p-4">পরিমাণ</th>
                        <th className="text-left text-brand-blue text-sm p-4">Affordable</th>
                        <th className="text-left text-brand-blue text-sm p-4">প্রতি পিস</th>
                        <th className="text-left text-brand-gold text-sm p-4">Premium</th>
                        <th className="text-left text-brand-gold text-sm p-4">প্রতি পিস</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingData.map((row, i) => (
                        <tr key={i} className={`border-b border-white/5 ${i === 1 ? 'bg-brand-blue/5' : ''}`}>
                          <td className="p-4 text-white font-semibold">{row.pcs}</td>
                          <td className="p-4 text-brand-blue font-bold">{row.aff}</td>
                          <td className="p-4 text-gray-400 text-sm">{row.perAff}</td>
                          <td className="p-4 text-brand-gold font-bold">{row.pre}</td>
                          <td className="p-4 text-gray-400 text-sm">{row.perPre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CONTACT & INFO */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: <Phone size={24} className="text-brand-blue" />, title: 'হটলাইন', value: '01701016826', sub: 'কল করুন', href: 'tel:01701016826' },
                  { icon: <MessageCircle size={24} className="text-green-400" />, title: 'WhatsApp', value: '01701016826', sub: 'Message করুন', href: 'https://wa.me/8801701016826' },
                  { icon: <Facebook size={24} className="text-blue-400" />, title: 'Facebook', value: 'BOONDHON Printing House', sub: 'Page দেখুন', href: 'https://www.facebook.com/bondhonbph' },
                  { icon: <Package size={24} className="text-brand-gold" />, title: 'অফিস', value: 'মানিকগঞ্জ', sub: 'Map দেখুন', href: 'https://maps.app.goo.gl/CnyRST5KxHjWDAtd9' },
                ].map((c, i) => (
                  <a key={i} href={c.href} target="_blank" rel="noreferrer"
                    className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-brand-blue/40 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">{c.icon}</div>
                    <div>
                      <p className="text-gray-400 text-sm">{c.title}</p>
                      <p className="text-white font-semibold">{c.value}</p>
                      <p className="text-brand-blue text-xs">{c.sub} →</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}