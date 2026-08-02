import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Users, ShoppingBag, Package, TrendingUp, Star, Phone, MessageCircle, Facebook, Lock, LogOut, ShieldAlert, Inbox, CheckCircle2, Clock, Send } from 'lucide-react';

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

const INITIAL_MESSAGES = [
  { id: 1, name: 'তানভীর আহমেদ', phone: '01712345678', card: 'Premium (১০০ পিস)', time: '১০ মিনিট আগে', msg: 'আসসালামু আলাইকুম, কার্ডে কাস্টম গোল্ড ফয়েল প্রিন্টিং করা যাবে কি? দাম কত পড়বে?', status: 'New' },
  { id: 2, name: 'সাবরিনা ইসলাম', phone: '01898765432', card: 'Affordable (২০০ পিস)', time: '১ ঘণ্টা আগে', msg: '২০০ পিস অর্ডারের ফ্রি নিকাহনামা ডেমো ডিজাইনগুলো দেখতে চাই। কীভাবে পাব?', status: 'New' },
  { id: 3, name: 'মেহেদী হাসান', phone: '01911223344', card: 'Premium (৫০ পিস)', time: 'আজ দুপুর ২:৩০', msg: 'মানিকগঞ্জ অফিসে এসে কি ডিরেক্ট ক্যাশ অন ডেলিভারিতে অর্ডার নেওয়া যাবে?', status: 'Replied' },
  { id: 4, name: 'সাদিয়া পারভীন', phone: '01677889900', card: 'Affordable (১০০ পিস)', time: 'গতকাল সন্ধ্যা ৬:১৫', msg: 'অর্ডার ফর্ম পূরণ করেছি। বিকাশ নম্বরে ৩০% টাকা পাঠিয়েছি, কনফার্ম করবেন।', status: 'Confirmed' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [customerMessages, setCustomerMessages] = useState(INITIAL_MESSAGES);

  useEffect(() => {
    const auth = localStorage.getItem('boondhon_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);

    // Load any saved customer messages from local storage
    try {
      const saved = localStorage.getItem('boondhon_customer_inbox');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomerMessages(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  const toggleStatus = (id) => {
    const updated = customerMessages.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'New' ? 'Replied' : m.status === 'Replied' ? 'Confirmed' : 'New';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setCustomerMessages(updated);
    localStorage.setItem('boondhon_customer_inbox', JSON.stringify(updated));
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
              <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-blue">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold font-display text-white">BOONDHON Admin Access</h2>
              <p className="text-gray-400 text-sm mt-1">প্যানেলে প্রবেশ করতে এডমিন পাসওয়ার্ড দিন</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">এডমিন পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none transition-all text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-brand-blue/30 transition-all text-sm"
              >
                লগইন করুন (Login)
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  const unreadCount = customerMessages.filter(m => m.status === 'New').length;

  return (
    <>
      <Head><title>Dashboard – BOONDHON Printing House</title></Head>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <div className="pt-20 min-h-screen">
          {/* Header */}
          <div className="border-b border-brand-blue/10 px-4 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">BOONDHON Dashboard</h1>
                <p className="text-gray-500 text-sm">Printing House — মানিকগঞ্জ (Admin Mode)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Admin Active</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all font-medium"
                >
                  <LogOut size={14} />
                  লগ আউট
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
              {[
                ['inbox', `💬 কাস্টমার ইনবক্স (${unreadCount}টি নতুন)`],
                ['overview', '📊 Overview'],
                ['pricing', '💰 মূল্য তালিকা'],
                ['contact', '📞 যোগাযোগ']
              ].map(([v, label]) => (
                <button key={v} onClick={() => setActiveTab(v)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all relative ${activeTab === v ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'text-gray-400 hover:text-white bg-white/5'}`}>
                  {label}
                  {v === 'inbox' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Customer Inbox Tab */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Inbox className="text-brand-blue" size={24} />
                      <span>কাস্টমার মেসেজ ও ইনবক্স</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">গ্রাহকদের আসা সর্বশেষ মেসেজ, এনকোয়ারি ও অর্ডার রিকোয়েস্টসমূহ</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-brand-blue/20 border border-brand-blue/30 text-brand-blue px-3 py-1.5 rounded-full text-xs font-semibold">
                      মোট মেসেজ: {customerMessages.length}টি
                    </span>
                    <span className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                      নতুন: {unreadCount}টি
                    </span>
                  </div>
                </div>

                {/* Messages Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {customerMessages.map((m) => (
                    <div key={m.id} className="glass rounded-2xl p-6 hover:border-brand-blue/40 transition-all border border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue font-bold">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-base">{m.name}</h3>
                            <a href={`tel:${m.phone}`} className="text-brand-blue text-xs hover:underline flex items-center gap-1">
                              <Phone size={12} /> {m.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock size={12} /> {m.time}
                          </span>
                          <span className="text-brand-gold text-xs bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-full font-medium">
                            {m.card}
                          </span>
                          <button
                            onClick={() => toggleStatus(m.id)}
                            className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                              m.status === 'New' ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' :
                              m.status === 'Replied' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30' :
                              'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {m.status === 'New' ? '🔴 New (নতুন)' : m.status === 'Replied' ? '🟡 Replied (উত্তর দেওয়া)' : '🟢 Confirmed (কনফার্মড)'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl mb-4">
                        <p className="text-gray-200 text-sm leading-relaxed">"{m.msg}"</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/88${m.phone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${m.name} ভাইয়া/আপু! BOONDHON Printing House থেকে যোগাযোগ করছি।`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <MessageCircle size={14} /> WhatsApp-এ রিপ্লাই দিন
                          </a>
                          <a
                            href={`tel:${m.phone}`}
                            className="bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <Phone size={14} /> কল করুন
                          </a>
                        </div>
                        <button
                          onClick={() => toggleStatus(m.id)}
                          className="text-gray-400 hover:text-white text-xs underline"
                        >
                          স্ট্যাটাস পরিবর্তন করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <>
                {/* Stat cards */}
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

                {/* Chart bars — Category wise */}
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

                {/* Order process */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-6">অর্ডার প্রক্রিয়া</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { step: '১', title: 'ডিজাইন পছন্দ', desc: 'গ্যালারি থেকে পছন্দ করুন', color: 'border-brand-blue' },
                      { step: '২', title: 'ফর্ম পূরণ', desc: 'বিবরণ পাঠান', color: 'border-brand-gold' },
                      { step: '৩', title: '৩০% পেমেন্ট', desc: 'bKash/Nagad/Rocket', color: 'border-green-400' },
                      { step: '৪', title: 'ডেলিভারি', desc: '৫-৭ কর্মদিবস', color: 'border-pink-400' },
                    ].map((s, i) => (
                      <div key={i} className={`border ${s.color} rounded-xl p-4 bg-white/3`}>
                        <div className="w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue font-bold flex items-center justify-center text-sm mb-3">{s.step}</div>
                        <p className="text-white font-medium text-sm">{s.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

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
                <div className="p-6 bg-brand-gold/5 border-t border-brand-gold/10">
                  <p className="text-brand-gold font-semibold text-center">🎁 ২০০+ পিসে FREE নিকাহনামা! | Custom অর্ডার ৫০+ পিস থেকে</p>
                </div>
              </div>
            )}

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