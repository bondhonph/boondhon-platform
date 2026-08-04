import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { driveUrl, AFFORDABLE_IDS, PREMIUM_IDS, getCardCode } from '../lib/data';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

const PAGE_SIZE = 24;

export default function Products() {
  const router = useRouter();
  const [tab, setTab] = useState('affordable');
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Touch Swipe Gesture State for Mobile Slider
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (router.query.tab === 'premium') setTab('premium');
    else setTab('affordable');
  }, [router.query.tab]);

  const ids = tab === 'premium' ? PREMIUM_IDS : AFFORDABLE_IDS;
  const totalPages = Math.ceil(ids.length / PAGE_SIZE);
  const visible = ids.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : ids.length - 1));
  }, [selectedIndex, ids.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => (prev < ids.length - 1 ? prev + 1 : 0));
  }, [selectedIndex, ids.length]);

  // Touch swipe handler
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext(); // Swiped Left -> Next Card
    } else if (diff < -50) {
      handlePrev(); // Swiped Right -> Previous Card
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard arrow keys navigation (Left/Right/Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  const selectedId = selectedIndex !== null ? ids[selectedIndex] : null;
  const selectedCode = selectedIndex !== null ? getCardCode(tab, selectedIndex) : null;

  return (
    <>
      <Head>
        <title>কার্ড গ্যালারি | ১৬০+ বিয়ের কার্ড ডিজাইন – BOONDHON Printing House</title>
        <meta name="description" content="BOONDHON Printing House-এর ১৬০+ সাশ্রয়ী ও প্রিমিয়াম বিয়ের কার্ড কালেকশন। সর্বনিম্ন ৫০ পিস থেকে অর্ডার। মানিকগঞ্জ ও সারাদেশে হোম ডেলিভারি।" />
        <meta name="keywords" content="বিয়ের কার্ড, Wedding Invitation Card, BOONDHON Printing House, Manikganj, Affordable Card, Premium Wedding Card Bangladesh" />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="কার্ড গ্যালারি | ১৬০+ বিয়ের কার্ড ডিজাইন – BOONDHON Printing House" />
        <meta property="og:description" content="সাশ্রয়ী ও রাজকীয় বিয়ের কার্ড গ্যালারি। ২০০+ পিসে FREE নিকাহনামা! মানিকগঞ্জ।" />
        <meta property="og:image" content="https://lh3.googleusercontent.com/d/182kOjBhoaqOTq7nr4ryI6re6fRuLITbH" />
        <meta property="og:url" content="https://boondhon-platform-qr9a.vercel.app/products" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="কার্ড গ্যালারি | BOONDHON Printing House" />
        <meta name="twitter:description" content="১৬০+ বিয়ের কার্ড কালেকশন থেকে পছন্দ করুন আপনার স্বপ্নের কার্ড।" />
      </Head>

      <div className="min-h-screen bg-brand-dark">
        <Navbar />

        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">কার্ড গ্যালারি</h1>
            <p className="text-gray-400">আমাদের সম্পূর্ণ কালেকশন থেকে আপনার পছন্দের ডিজাইন বেছে নিন (ছবিতে ক্লিক করে বড় করে স্লাইড করুন)</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={() => { setTab('affordable'); setPage(1); setSelectedIndex(null); }}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${tab === 'affordable' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10'}`}>
              🌸 Affordable ({AFFORDABLE_IDS.length})
            </button>
            <button onClick={() => { setTab('premium'); setPage(1); setSelectedIndex(null); }}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${tab === 'premium' ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/30' : 'border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10'}`}>
              ✨ Premium ({PREMIUM_IDS.length})
            </button>
          </div>

          {/* Price badge */}
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${tab === 'affordable' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'}`}>
              {tab === 'affordable'
                ? '৫০পিস=২,৭৫০৳ | ১০০পিস=৪,৫০০৳ | ২০০পিস=৭,০০০৳'
                : '৫০পিস=৩,২৫০৳ | ১০০পিস=৫,৫০০৳ | ২০০পিস=৯,০০০৳'}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visible.map((id, i) => {
              const globalIdx = (page - 1) * PAGE_SIZE + i;
              const cardCode = getCardCode(tab, globalIdx);

              return (
                <div key={id} className="img-card cursor-pointer relative group" onClick={() => setSelectedIndex(globalIdx)}>
                  {/* Card Code Badge */}
                  <div className="absolute top-2 left-2 z-10 bg-slate-900/90 border border-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-md">
                    {cardCode}
                  </div>

                  {tab === 'premium' && (
                    <div className="absolute top-2 right-2 z-10 bg-brand-gold text-black text-xs px-2 py-0.5 rounded-full font-bold">P</div>
                  )}

                  {/* Zoom indicator icon */}
                  <div className="absolute bottom-2 right-2 z-10 bg-slate-900/80 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Maximize2 size={12} />
                  </div>

                  <img
                    src={driveUrl(id)}
                    alt={`${tab === 'premium' ? 'Premium' : 'Affordable'} wedding card design ${cardCode} - BOONDHON Manikganj`}
                    loading="lazy"
                    onError={e => { e.target.parentElement.style.display='none'; }}
                  />

                  <div className="overlay">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/order?design=${cardCode}&type=${tab}`);
                      }}
                      className={`w-full text-center py-2 rounded-lg text-xs font-semibold ${tab === 'premium' ? 'bg-brand-gold text-black' : 'bg-brand-blue text-white'}`}>
                      অর্ডার করুন ({cardCode})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="px-4 py-2 rounded-full border border-brand-blue/30 text-brand-blue disabled:opacity-30 hover:bg-brand-blue/10 transition-all">
                ← আগে
              </button>
              {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${p===page ? 'bg-brand-blue text-white' : 'border border-brand-blue/20 text-gray-400 hover:border-brand-blue/50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="px-4 py-2 rounded-full border border-brand-blue/30 text-brand-blue disabled:opacity-30 hover:bg-brand-blue/10 transition-all">
                পরে →
              </button>
            </div>
          )}

          {/* Order CTA */}
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-4">পছন্দের ডিজাইন পেয়েছেন? এখনই অর্ডার করুন!</p>
            <Link href="/order" className="bg-gradient-to-r from-brand-blue to-blue-400 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all">
              অর্ডার করুন 🌸
            </Link>
          </div>
        </div>

        {/* Full-screen Lightbox Modal with Next/Previous Side Arrows & Touch Swipe */}
        {selectedIndex !== null && selectedId && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 select-none animate-fade-in" onClick={() => setSelectedIndex(null)}>
            
            {/* Modal Container */}
            <div className="relative max-w-xl w-full" onClick={e => e.stopPropagation()}>

              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-12 right-0 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={22} />
              </button>

              {/* Main Card Image Box with Touch Swipe Listeners */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-950 group">
                <img
                  src={driveUrl(selectedId)}
                  alt={`Wedding card ${selectedCode}`}
                  className="w-full max-h-[75vh] object-contain mx-auto transition-transform duration-300"
                />

                {/* Left Side Arrow Button (ON IMAGE) */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  title="পূর্ববর্তী কার্ড (Previous Card)"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/85 border border-white/30 text-white flex items-center justify-center hover:bg-brand-blue hover:border-brand-blue hover:scale-110 active:scale-95 transition-all shadow-2xl z-30">
                  <ChevronLeft size={30} />
                </button>

                {/* Right Side Arrow Button (ON IMAGE) */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  title="পরবর্তী কার্ড (Next Card)"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/85 border border-white/30 text-white flex items-center justify-center hover:bg-brand-blue hover:border-brand-blue hover:scale-110 active:scale-95 transition-all shadow-2xl z-30">
                  <ChevronRight size={30} />
                </button>

                {/* Top Badge: Design Code & Counter */}
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2 z-20">
                  <span className="text-brand-gold font-bold">{selectedCode}</span>
                  <span className="text-gray-300 text-[11px]">({selectedIndex + 1} / {ids.length})</span>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/order?design=${selectedCode}&type=${tab}`}
                  className="flex-1 text-center bg-gradient-to-r from-brand-blue to-blue-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl hover:shadow-brand-blue/30 hover:opacity-95 transition-all">
                  এই ডিজাইনে অর্ডার করুন ({selectedCode})
                </Link>
                <a href={`https://wa.me/8801863586302?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ${selectedCode} ডিজাইনটি পছন্দ করেছি: ${driveUrl(selectedId)}`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 text-center bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-500 transition-all shadow-lg">
                  WhatsApp করুন
                </a>
              </div>

              <p className="text-center text-gray-400 text-xs mt-2.5 font-medium">
                💡 ডানে/বামে সোয়াইপ করুন বা Left (←) ও Right (→) কি চেপে পরের ছবিগুলো দেখুন।
              </p>
            </div>

          </div>
        )}

        <Footer />
        <Chatbot />
      </div>
    </>
  );
}
