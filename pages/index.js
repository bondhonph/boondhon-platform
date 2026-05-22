import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { driveUrl, AFFORDABLE_IDS, PREMIUM_IDS } from '../lib/data';
import { Star, ChevronRight, Package, Clock, Shield, Sparkles } from 'lucide-react';

const PETALS = ['🌸', '🌺', '💮', '🌹', '🏵️'];

export default function Home() {
  const [petals, setPetals] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const arr = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: PETALS[i % PETALS.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 14 + Math.random() * 16,
    }));
    setPetals(arr);
  }, []);

  const featuredAffordable = AFFORDABLE_IDS.slice(0, 4);
  const featuredPremium = PREMIUM_IDS.slice(0, 4);

  return (
    <>
      <Head>
        <title>BOONDHON Printing House – Design Your Dream</title>
        <meta name="description" content="বাংলাদেশের সেরা ওয়েডিং কার্ড প্রিন্টিং হাউস। Affordable ও Premium বিয়ের কার্ড। মানিকগঞ্জ।" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-brand-dark relative overflow-hidden">
        <Navbar />

        {/* Petals */}
        {mounted && petals.map(p => (
          <span key={p.id} className="fixed pointer-events-none z-0 select-none"
            style={{
              left: `${p.left}%`, top: '-30px',
              fontSize: `${p.size}px`,
              animation: `petal ${p.duration}s linear ${p.delay}s infinite`,
            }}>{p.emoji}</span>
        ))}

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center pt-16">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 px-4 py-2 rounded-full text-brand-blue text-sm mb-8">
              <Sparkles size={14} />
              <span>বাংলাদেশের বিশ্বস্ত ওয়েডিং কার্ড প্রিন্টার</span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div className="w-12 h-12 rounded-full border-3 border-brand-gold absolute left-2 top-4" style={{borderWidth:'3px'}}></div>
                <div className="w-12 h-12 rounded-full border-3 border-brand-blue absolute right-2 top-4" style={{borderWidth:'3px'}}></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 leading-tight">
              <span className="text-white">BOONDHON</span><br />
              <span className="gold-text">Printing House</span>
            </h1>

            <p className="text-brand-blue text-2xl md:text-3xl font-display italic mb-6">"Design Your Dream"</p>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              আপনার স্বপ্নের বিয়ের কার্ড এখন আরো সুন্দর, আরো স্মার্ট। Affordable থেকে Premium — সব ধরনের কার্ড এক জায়গায়।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="bg-gradient-to-r from-brand-blue to-blue-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-brand-blue/30 transition-all flex items-center justify-center gap-2">
                কার্ড দেখুন <ChevronRight size={20} />
              </Link>
              <Link href="/order" className="border border-brand-gold/50 text-brand-gold px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-gold/10 transition-all">
                অর্ডার করুন 🌸
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-brand-gold fill-brand-gold" />)}
              <span className="text-gray-400 text-sm ml-2">৫০০+ সন্তুষ্ট গ্রাহক</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Package size={28} className="text-brand-blue" />, title: 'সর্বনিম্ন ৫০ পিস', desc: 'মাত্র ৫০ পিস থেকে অর্ডার করা যায়। ছোট পরিবার থেকে বড় আয়োজন — সবার জন্য।' },
              { icon: <Clock size={28} className="text-brand-gold" />, title: '৫-৭ কর্মদিবস', desc: 'দ্রুত ডেলিভারি। অর্ডার নিশ্চিত হওয়ার ৫-৭ কর্মদিবসের মধ্যে আপনার হাতে।' },
              { icon: <Shield size={28} className="text-green-400" />, title: 'ডেমো দেখে Approve', desc: 'Print এর আগে ডেমো ডিজাইন দেখাবো। Approve করলে তবেই Print শুরু।' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-brand-blue/40 transition-all card-hover" style={{transition:'all 0.3s'}}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-white font-display font-semibold text-xl mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Affordable */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-blue text-sm uppercase tracking-widest">Budget Friendly</span>
            <h2 className="text-4xl font-display font-bold text-white mt-2 mb-2">Affordable কার্ড</h2>
            <p className="text-gray-400">৫০ পিস মাত্র ২,৭৫০৳ থেকে শুরু</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredAffordable.map((id, i) => (
              <div key={id} className="img-card">
                <img src={driveUrl(id)} alt={`Affordable Card ${i+1}`} loading="lazy" onError={e => e.target.style.display='none'} />
                <div className="overlay">
                  <Link href="/order" className="w-full text-center bg-brand-blue text-white py-2 rounded-lg text-sm font-semibold">অর্ডার করুন</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products?tab=affordable" className="border border-brand-blue/40 text-brand-blue px-8 py-3 rounded-full hover:bg-brand-blue/10 transition-all">
              সব Affordable কার্ড দেখুন →
            </Link>
          </div>
        </section>

        {/* Featured Premium */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-sm uppercase tracking-widest">Luxury Collection</span>
            <h2 className="text-4xl font-display font-bold text-white mt-2 mb-2">Premium কার্ড</h2>
            <p className="text-gray-400">৫০ পিস মাত্র ৩,২৫০৳ থেকে শুরু</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredPremium.map((id, i) => (
              <div key={id} className="img-card">
                <div className="absolute top-2 right-2 z-10 bg-brand-gold text-black text-xs px-2 py-1 rounded-full font-bold">Premium</div>
                <img src={driveUrl(id)} alt={`Premium Card ${i+1}`} loading="lazy" onError={e => e.target.style.display='none'} />
                <div className="overlay">
                  <Link href="/order" className="w-full text-center bg-brand-gold text-black py-2 rounded-lg text-sm font-semibold">অর্ডার করুন</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products?tab=premium" className="border border-brand-gold/40 text-brand-gold px-8 py-3 rounded-full hover:bg-brand-gold/10 transition-all">
              সব Premium কার্ড দেখুন →
            </Link>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-2">মূল্য তালিকা</h2>
            <p className="text-brand-blue mb-8">সহজ, স্বচ্ছ মূল্য — কোনো লুকানো চার্জ নেই</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { pcs: '৫০ পিস', aff: '২,৭৫০৳', pre: '৩,২৫০৳' },
                { pcs: '১০০ পিস', aff: '৪,৫০০৳', pre: '৫,৫০০৳' },
                { pcs: '২০০ পিস', aff: '৭,০০০৳', pre: '৯,০০০৳' },
              ].map((p, i) => (
                <div key={i} className={`rounded-2xl p-4 ${i===1 ? 'bg-brand-blue/20 border border-brand-blue/40' : 'bg-white/5'}`}>
                  <p className="text-white font-bold text-lg mb-2">{p.pcs}</p>
                  <p className="text-gray-300 text-sm">Affordable: <span className="text-brand-blue font-semibold">{p.aff}</span></p>
                  <p className="text-gray-300 text-sm">Premium: <span className="text-brand-gold font-semibold">{p.pre}</span></p>
                </div>
              ))}
            </div>
            <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-4 mb-8">
              <p className="text-brand-gold font-semibold">🎁 ২০০+ পিসে FREE নিকাহনামা!</p>
            </div>
            <Link href="/pricing" className="bg-gradient-to-r from-brand-blue to-blue-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
              সম্পূর্ণ মূল্য তালিকা দেখুন
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-display font-bold text-white mb-4">আজই অর্ডার করুন</h2>
            <p className="text-gray-400 mb-8">৩০% অগ্রিম পেমেন্টে অর্ডার কনফার্ম করুন। ডেমো দেখে Approve করুন।</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="bg-gradient-to-r from-brand-blue to-blue-400 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-brand-blue/30 transition-all">
                অর্ডার ফর্ম পূরণ করুন 🌸
              </Link>
              <a href="https://wa.me/8801701016826" target="_blank" rel="noreferrer"
                className="bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-500 transition-all">
                WhatsApp করুন 💬
              </a>
            </div>
          </div>
        </section>

        <Footer />
        <Chatbot />
      </div>
    </>
  );
}