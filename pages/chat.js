import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { 
  Phone, UserCheck, Bot, RefreshCw, Image as ImageIcon, Send, Clock, Zap, 
  AlertTriangle, Smartphone, Tag, CheckCheck, Search, MoreVertical, Plus, Filter, Users, Lock, LogOut, ShieldCheck
} from 'lucide-react';

const DEFAULT_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

const CRM_LABEL_DOTS = {
  'New customer': '#3b82f6',
  'New order': '#eab308',
  'Paid': '#a855f7',
  'Lead': '#8b5cf6',
  'Follow up': '#22c55e',
  'Pending payment': '#ef4444',
  'Delivered': '#6366f1'
};

const CRM_LABEL_BADGES = {
  'New customer': 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/40',
  'New order': 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/40',
  'Paid': 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/40',
  'Lead': 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/40',
  'Follow up': 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40',
  'Pending payment': 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40',
  'Delivered': 'bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/40'
};

export default function ChatDashboard() {
  const router = useRouter();
  const { phone: queryPhone } = router.query;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [crmLabels, setCrmLabels] = useState([
    'New customer', 'New order', 'Paid', 'Lead', 'Follow up', 'Pending payment', 'Delivered'
  ]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const messagesEndRef = useRef(null);

  // Check saved PIN authentication
  useEffect(() => {
    const authSaved = localStorage.getItem('boondhon_admin_auth');
    if (authSaved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e) => {
    e?.preventDefault();
    if (pinInput === DEFAULT_PIN || pinInput === '1234') {
      localStorage.setItem('boondhon_admin_auth', 'true');
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('boondhon_admin_auth');
    setIsAuthenticated(false);
  };

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
    if (!isAuthenticated) return;
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
    if (!phone || !isAuthenticated) return;
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
    if (isAuthenticated) {
      fetchConversations();
      const interval = setInterval(() => {
        fetchConversations();
        if (selectedPhone) {
          fetchActiveConversation(selectedPhone);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [selectedPhone, isAuthenticated]);

  useEffect(() => {
    if (selectedPhone && isAuthenticated) {
      fetchActiveConversation(selectedPhone);
    }
  }, [selectedPhone, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleUpdateLabel = async (newLabel) => {
    if (!selectedPhone) return;
    setShowLabelMenu(false);
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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
      label: activeConv.label || 'New customer'
    });
  }

  const filteredConvs = combinedConversations.filter(c => {
    const matchesSearch = c.phone.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return (c.unreadCount || 0) > 0;
    return (c.label || 'New customer') === activeFilter;
  });

  const unreadTotal = combinedConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // ── PIN AUTHENTICATION MODAL SCREEN ──
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>🔒 PIN Security – BOONDHON Chat</title>
        </Head>
        <div className="min-h-screen bg-[#0b141a] font-sans flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl p-6 md:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center mx-auto text-2xl animate-bounce">
              🔒
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-1">BOONDHON Chat Admin Security</h2>
              <p className="text-gray-400 text-xs">চ্যাট ড্যাশবোর্ডে প্রবেশ করতে সিকিউরিটি পিন (PIN) দিন</p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-1.5">
                <AlertTriangle size={14} />
                <span>ভুল PIN দিয়েছেন! সঠিক অ্যাডমিন পিন দিন।</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input 
                  type="password"
                  maxLength={6}
                  placeholder="সিক্রেট PIN (ডিফল্ট: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-[#202c33] border border-[#3b4a54] focus:border-[#00a884] rounded-xl px-4 py-3 text-center text-lg text-white font-mono tracking-widest focus:outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <ShieldCheck size={18} />
                <span>প্রবেশ করুন</span>
              </button>
            </form>

            <p className="text-[11px] text-gray-500">
              ডিফল্ট পিন কোড: <strong className="text-gray-300">1234</strong>
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Chats – BOONDHON WhatsApp Web</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="min-h-screen bg-[#0b141a] font-sans text-gray-100 flex flex-col">
        <Navbar />
        <div className="pt-16 flex-1 flex flex-col">
          
          {/* Main Container */}
          <div className="flex-1 max-w-[1600px] w-full mx-auto p-0 md:p-3 flex flex-col">
            {errorMessage && (
              <div className="m-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400" />
                  <span><strong>ত্রুটি:</strong> {errorMessage}</span>
                </div>
                <button onClick={() => setErrorMessage('')} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded">
                  Dismiss
                </button>
              </div>
            )}

            {/* WhatsApp Web Outer Window */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-t md:border border-[#222d34] bg-[#111b21] shadow-2xl min-h-[680px]">
              
              {/* ── LEFT SIDEBAR (EXACT MATCH TO SCREENSHOT) ── */}
              <div className="lg:col-span-4 border-r border-[#222d34] flex flex-col bg-[#111b21] relative">
                
                {/* 1. Header Bar: "Chats", [+], [:], Profile */}
                <div className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
                  <h1 className="text-lg font-bold text-white tracking-wide">Chats</h1>
                  
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <button onClick={handleInstallApp} title="Install App" className="p-1.5 hover:bg-[#2a3942] rounded-full text-[#00a884]">
                      <Smartphone size={18} />
                    </button>

                    <button onClick={fetchConversations} title="New Chat" className="p-1.5 hover:bg-[#2a3942] rounded-full">
                      <Plus size={18} />
                    </button>
                    
                    {/* Menu Button (Toggles Label Popup) */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowLabelMenu(!showLabelMenu)} 
                        className="p-1.5 hover:bg-[#2a3942] rounded-full text-gray-300"
                        title="Labels Menu"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* POPUP MENU MATCHING SCREENSHOT EXACTLY */}
                      {showLabelMenu && (
                        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#202c33] border border-[#3b4a54] shadow-2xl z-50 py-2 text-xs divide-y divide-[#2a3942]">
                          <div className="px-3 py-2 text-gray-300 font-medium flex items-center gap-2 hover:bg-[#2a3942] cursor-pointer">
                            <Users size={14} />
                            <span>Groups</span>
                          </div>

                          <div className="py-1">
                            {crmLabels.map(lbl => (
                              <div
                                key={lbl}
                                onClick={() => {
                                  if (selectedPhone) handleUpdateLabel(lbl);
                                  else setActiveFilter(lbl);
                                }}
                                className="px-3 py-2 flex items-center gap-2.5 hover:bg-[#2a3942] cursor-pointer text-gray-200"
                              >
                                <span 
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: CRM_LABEL_DOTS[lbl] || '#3b82f6' }}
                                />
                                <span className="font-medium">{lbl}</span>
                              </div>
                            ))}
                          </div>

                          <div className="px-3 py-2 text-[#00a884] font-medium flex items-center gap-2 hover:bg-[#2a3942] cursor-pointer">
                            <Plus size={14} />
                            <span>New list</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lock / Logout Button */}
                    <button 
                      onClick={handleLogout}
                      title="Lock Dashboard"
                      className="p-1.5 hover:bg-rose-500/20 rounded-full text-rose-400 transition"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. Search Bar: "Search or start a new chat" */}
                <div className="p-2.5 bg-[#111b21] border-b border-[#222d34]">
                  <div className="relative flex items-center">
                    <Search size={15} className="absolute left-3 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search or start a new chat"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#202c33] border border-transparent focus:border-[#00a884] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Filter Pills Bar: "All", "Unread 12", "Favourites", etc. */}
                <div className="px-2.5 py-2 bg-[#111b21] border-b border-[#222d34] flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <button
                    onClick={() => setActiveFilter('All')}
                    className={`px-3 py-1 rounded-full font-medium transition ${
                      activeFilter === 'All' 
                        ? 'bg-[#00a884] text-black font-bold' 
                        : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setActiveFilter('Unread')}
                    className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
                      activeFilter === 'Unread' 
                        ? 'bg-[#00a884] text-black font-bold' 
                        : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
                    }`}
                  >
                    <span>Unread</span>
                    {unreadTotal > 0 && <span className="text-[10px] bg-[#25d366] text-black font-bold px-1.5 rounded-full">{unreadTotal}</span>}
                  </button>

                  {crmLabels.map(lbl => (
                    <button
                      key={lbl}
                      onClick={() => setActiveFilter(lbl)}
                      className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                        activeFilter === lbl 
                          ? 'bg-[#00a884] text-black font-bold' 
                          : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CRM_LABEL_DOTS[lbl] || '#3b82f6' }}
                      />
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>

                {/* 4. Chat List Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]">
                  {filteredConvs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      কোনো কাস্টমার চ্যাট পাওয়া যায়নি।<br/>হোয়াটসঅ্যাপে মেসেজ আসলে এখানে দেখা যাবে।
                    </div>
                  ) : (
                    filteredConvs.map((conv) => {
                      const isSelected = selectedPhone === conv.phone;
                      const remainingMins = getRemainingMinutes(conv.paused_until);
                      const labelText = conv.label || 'New customer';
                      const dotColor = CRM_LABEL_DOTS[labelText] || '#3b82f6';
                      const badgeClass = CRM_LABEL_BADGES[labelText] || CRM_LABEL_BADGES['New customer'];

                      return (
                        <div 
                          key={conv.phone}
                          onClick={() => setSelectedPhone(conv.phone)}
                          className={`p-3 cursor-pointer transition-all hover:bg-[#202c33] ${
                            isSelected ? 'bg-[#2a3942] border-l-4 border-[#00a884]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-full bg-[#2a3942] text-gray-300 font-bold flex items-center justify-center text-sm border border-[#3b4a54]">
                                👤
                              </div>
                              <span 
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111b21]"
                                style={{ backgroundColor: dotColor }}
                                title={labelText}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-semibold text-white text-xs truncate flex items-center gap-1">
                                  {conv.name}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(conv.lastTimestamp)}</span>
                              </div>

                              <p className="text-gray-400 text-xs truncate mb-1.5 flex items-center gap-1">
                                <CheckCheck size={14} className="text-[#53bdeb] flex-shrink-0" />
                                <span className="truncate">{conv.lastMessage || 'মেসেজ শুরু হয়েছে'}</span>
                              </p>

                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className={`px-2 py-0.5 rounded border text-[9px] font-medium flex items-center gap-1 ${badgeClass}`}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                                  {labelText}
                                </span>

                                {conv.human_active ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-medium flex items-center gap-1">
                                    <UserCheck size={9} />
                                    Active ({remainingMins}m)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-medium flex items-center gap-1">
                                    <Bot size={9} />
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

              {/* ── RIGHT CHAT WINDOW (WhatsApp Web Wallpaper & Design) ── */}
              <div className="lg:col-span-8 flex flex-col bg-[#0b141a] relative">
                {activeConv ? (
                  <>
                    {/* Active Chat Header Bar */}
                    <div className="p-3 border-b border-[#222d34] bg-[#202c33] flex flex-wrap items-center justify-between gap-3 z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a3942] text-gray-200 font-bold flex items-center justify-center text-base border border-[#3b4a54]">
                          👤
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white">
                              {activeConv.name}
                            </h2>

                            {/* Label Selector Dropdown with Colored Dot */}
                            <div className="flex items-center gap-1.5 bg-[#111b21] border border-[#3b4a54] rounded-lg px-2.5 py-0.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: CRM_LABEL_DOTS[activeConv.label || 'New customer'] || '#3b82f6' }}
                              />
                              <select
                                value={activeConv.label || 'New customer'}
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
                          <p className="text-[11px] text-[#00a884] font-medium">
                            {activeConv.human_active ? 'Human Takeover Mode' : 'AI Bot Ananya Active'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeConv.human_active ? (
                          <button 
                            onClick={() => handleToggleBot(false)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition"
                          >
                            <Bot size={14} />
                            Resume Bot Now
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleBot(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition"
                          >
                            <UserCheck size={14} />
                            Pause Bot (30m)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Messages Panel */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]">
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
                              <div className={`max-w-[85%] md:max-w-[70%] rounded-xl p-3 text-xs shadow-md relative ${
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

                    {/* Quick Reply Bar */}
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

                    {/* WhatsApp Input Bar */}
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
                          placeholder="Type a message"
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
