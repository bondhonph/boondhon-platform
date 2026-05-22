import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { Check, Gift } from 'lucide-react';

const plans = [
  {
    pcs: 50, label: '৫০ পিস',
    affordable: 2750, premium: 3250,
    perPiece: { aff: 55, pre: 65 },
    badge: null,
  },
  {
    pcs: 100, label: '১০০ পিস',
    affordable: 4500, premium: 5500,
    perPiece: { aff: 45, pre: 55 },
    badge: 'জনপ্রিয়',
  },
  {
    pcs: 200, label: '২০০ পিস',
    affordable: 7000, premium: 9000,
    perPiece: { aff: 35, pre: 45 },
    badge: '+ FREE নিকাহনামা 🎁',
  },
];

const features = [
  'ডেমো ডিজাইন দেখে Approve করুন',
  'বাংলা ও English দুই ভাষায় কার্ড',
  'দ্রুত ৫-৭ কর্মদিবসে ডেলিভারি',
  'সারাদেশে কুরিয়ার সেবা',
  'কাস্টম ডিজাইন সুবিধা',
  '৩০% অগ্রিম, বাকি ডেলিভারিতে',
];

export default function Pricing() {
  return (
    <>
      <Head><title>মূল্য তালিকা – BOONDHON Printing House</title></Head>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold text-white mb-4">মূল্য তালিকা</h1>
            <p className="text-gray-400 text-lg">সহজ ও স্বচ্ছ মূল্য — কোনো লুকানো চার্জ নেই</p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, i) => (
              <div key={i} className={`relative glass rounded-3xl p-8 flex flex-col ${i===1 ? 'border-brand-blue/50 shadow-xl shadow-brand-blue/10' : ''}`}>
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full text-sm font-bold ${i===1 ? 'bg-brand-blue text-white' : 'bg-brand-gold text-black'}`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-3xl font-display font-bold text-white text-center mb-8">{plan.label}</h3>

                <div className="space-y-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-5">
                    <p className="text-brand-blue text-xs uppercase tracking-widest mb-1">Affordable</p>
                    <p className="text-3xl font-bold text-white">{plan.affordable.toLocaleString()}৳</p>
                    <p className="text-gray-500 text-sm">প্রতি পিস ≈ {plan.perPiece.aff}৳</p>
                  </div>
                  <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-5">
                    <p className="text-brand-gold text-xs uppercase tracking-widest mb-1">Premium</p>
                    <p className="text-3xl font-bold text-white">{plan.premium.toLocaleString()}৳</p>
                    <p className="text-gray-500 text-sm">প্রতি পিস ≈ {plan.perPiece.pre}৳</p>
                  </div>
                </div>

                <Link href="/order"
                  className={`mt-auto w-full text-center py-3 rounded-full font-semibold transition-all ${i===1 ? 'bg-gradient-to-r from-brand-blue to-blue-400 text-white hover:shadow-lg hover:shadow-brand-blue/30' : 'border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/10'}`}>
                  এখনই অর্ডার করুন
                </Link>
              </div>
            ))}
          </div>

          {/* Custom */}
          <div className="glass rounded-3xl p-8 mb-12 text-center">
            <Gift size={40} className="text-brand-gold mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold text-white mb-2">Custom অর্ডার (৫০+ পিস)</h3>
            <p className="text-gray-400 mb-4">৫০ পিসের বেশি যেকোনো পরিমাণে অর্ডার করতে পারবেন। বেশি পিসে আরো ভালো দাম পাবেন।</p>
            <a href="https://wa.me/8801701016826?text=Custom order inquiry"
              target="_blank" rel="noreferrer"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-500 transition-all">
              WhatsApp-এ কথা বলুন
            </a>
          </div>

          {/* Payment info */}
          <div className="glass rounded-3xl p-8 mb-12">
            <h3 className="text-2xl font-display font-bold text-white mb-6 text-center">পেমেন্ট পদ্ধতি</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { name: 'bKash', color: 'text-pink-400', num: '01682588856', type: 'Personal' },
                { name: 'Nagad', color: 'text-orange-400', num: '01682588856', type: 'Personal' },
                { name: 'Rocket', color: 'text-purple-400', num: '01682588856', type: 'Personal' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className={`text-xl font-bold ${m.color} mb-1`}>{m.name}</p>
                  <p className="text-white font-mono text-lg">{m.num}</p>
                  <p className="text-gray-500 text-xs">{m.type}</p>
                </div>
              ))}
            </div>
            <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-2xl p-4 text-center">
              <p className="text-brand-blue font-semibold">💡 মোট বিলের ৩০% অগ্রিম → বাকি ৭০% ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>

          {/* Features */}
          <div className="glass rounded-3xl p-8">
            <h3 className="text-2xl font-display font-bold text-white mb-6 text-center">সব প্যাকেজে যা পাবেন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  <Check size={18} className="text-brand-blue flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </div>
    </>
  );
}