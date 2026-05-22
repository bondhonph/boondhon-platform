import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { ChevronDown } from 'lucide-react';

const QUANTITIES = [50, 100, 200];

export default function Order() {
  const [lang, setLang] = useState('bangla');
  const [qty, setQty] = useState(50);
  const [customQty, setCustomQty] = useState('');
  const [tier, setTier] = useState('affordable');
  const [form, setForm] = useState({
    // Groom
    groomName: '', groomFather: '', groomMother: '', groomAddress: '',
    // Bride
    brideName: '', brideFather: '', brideMother: '', brideAddress: '',
    // Holud
    holudDateEn: '', holudDateBn: '', holudDay: '', holudTime: '', holudVenue: '',
    // Wedding
    weddingDateEn: '', weddingDateBn: '', weddingDay: '', weddingLagna: '', weddingTime: '', weddingVenue: '',
    // Reception
    receptionDateEn: '', receptionDateBn: '', receptionDay: '', receptionTime: '', receptionVenue: '',
    // Extra
    childrenNames: '', contactPhone: '', regardsName: '',
    groomChildNo: '', brideChildNo: '', cardSide: '',
    // Courier
    courierName: '', courierPhone: '', courierAddress: '',
  });

  const pricing = {
    50: { affordable: 2750, premium: 3250 },
    100: { affordable: 4500, premium: 5500 },
    200: { affordable: 7000, premium: 9000 },
  };

  const finalQty = customQty ? parseInt(customQty) : qty;
  const price = pricing[qty]?.[tier] || (tier === 'affordable' ? 2750 : 3250);
  const advance = Math.ceil(price * 0.3);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const selectedQty = customQty || qty;
    let msg = lang === 'bangla'
      ? `📝 *BOONDHON বিয়ের কার্ড অর্ডার* 🌸\n\n`
        + `📦 পরিমাণ: ${selectedQty} পিস\n`
        + `💎 ধরন: ${tier === 'premium' ? 'Premium' : 'Affordable'}\n\n`
        + `👰‍♂️ *বর-*\nনাম: ${form.groomName}\nপিতা: ${form.groomFather}\nমাতা: ${form.groomMother}\nঠিকানা: ${form.groomAddress}\n\n`
        + `👰 *কনে-*\nনাম: ${form.brideName}\nপিতা: ${form.brideFather}\nমাতা: ${form.brideMother}\nঠিকানা: ${form.brideAddress}\n\n`
        + `💛 *গায়ে হলুদ-*\nতারিখ (ইং): ${form.holudDateEn}\nতারিখ (বাং): ${form.holudDateBn}\nরোজ: ${form.holudDay}\nসময়: ${form.holudTime}\nস্থান: ${form.holudVenue}\n\n`
        + `💍 *শুভ বিবাহ-*\nতারিখ (ইং): ${form.weddingDateEn}\nতারিখ (বাং): ${form.weddingDateBn}\nরোজ: ${form.weddingDay}\nলগ্ন: ${form.weddingLagna}\nসময়: ${form.weddingTime}\nস্থান: ${form.weddingVenue}\n\n`
        + `🎉 *বৌ-ভাত-*\nতারিখ (ইং): ${form.receptionDateEn}\nতারিখ (বাং): ${form.receptionDateBn}\nরোজ: ${form.receptionDay}\nসময়: ${form.receptionTime}\nস্থান: ${form.receptionVenue}\n\n`
        + `শিশু: ${form.childrenNames}\nযোগাযোগ: ${form.contactPhone}\nশুভেচ্ছান্তে: ${form.regardsName}\n\n`
        + `বর কততম সন্তান: ${form.groomChildNo}\nকনে কততম সন্তান: ${form.brideChildNo}\nকার্ড: ${form.cardSide} পক্ষ\n\n`
        + `🚚 *কুরিয়ার:*\nনাম: ${form.courierName}\nমোবাইল: ${form.courierPhone}\nঠিকানা: ${form.courierAddress}`
      : `📝 *BOONDHON Wedding Card Order* 🌸\n\n`
        + `📦 Quantity: ${selectedQty} pcs\n💎 Type: ${tier === 'premium' ? 'Premium' : 'Affordable'}\n\n`
        + `👰‍♂️ *Groom:*\nName: ${form.groomName}\nFather: ${form.groomFather}\nMother: ${form.groomMother}\n\n`
        + `👰 *Bride:*\nName: ${form.brideName}\nFather: ${form.brideFather}\nMother: ${form.brideMother}\n\n`
        + `💛 *Holud:*\nDay: ${form.holudDay}, Date: ${form.holudDateEn}\nTime: ${form.holudTime}, Venue: ${form.holudVenue}\n\n`
        + `💍 *Wedding:*\nDay: ${form.weddingDay}, Date: ${form.weddingDateEn}\nTime: ${form.weddingTime}, Venue: ${form.weddingVenue}\n\n`
        + `🎉 *Reception:*\nDay: ${form.receptionDay}, Date: ${form.receptionDateEn}\nTime: ${form.receptionTime}, Venue: ${form.receptionVenue}\n\n`
        + `RSVP: ${form.contactPhone}, Regards: ${form.regardsName}\n\n`
        + `🚚 *Courier:*\nName: ${form.courierName}, Phone: ${form.courierPhone}\nAddress: ${form.courierAddress}`;

    const url = `https://wa.me/8801701016826?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const F = ({ label, k, placeholder, type = 'text' }) => (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <input type={type} placeholder={placeholder || label}
        value={form[k]} onChange={e => update(k, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-blue focus:outline-none focus:bg-white/8 transition-all text-sm" />
    </div>
  );

  return (
    <>
      <Head><title>অর্ডার করুন – BOONDHON Printing House</title></Head>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-display font-bold text-white mb-2">অর্ডার করুন</h1>
            <p className="text-gray-400">ফর্মটি পূরণ করুন — WhatsApp-এ সরাসরি পাঠানো হবে</p>
          </div>

          <div className="glass rounded-3xl p-6 md:p-10 space-y-8">

            {/* Tier */}
            <div>
              <p className="text-white font-semibold mb-3">কার্ডের ধরন বেছে নিন</p>
              <div className="grid grid-cols-2 gap-3">
                {[['affordable', '🌸 Affordable', 'বাজেট ফ্রেন্ডলি'], ['premium', '✨ Premium', 'লাক্সারি কালেকশন']].map(([v, label, sub]) => (
                  <button key={v} onClick={() => setTier(v)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${tier === v ? (v === 'premium' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-blue bg-brand-blue/10') : 'border-white/10 hover:border-white/20'}`}>
                    <p className={`font-semibold ${v === 'premium' ? 'text-brand-gold' : 'text-brand-blue'}`}>{label}</p>
                    <p className="text-gray-400 text-xs mt-1">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-white font-semibold mb-3">পরিমাণ (পিস)</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {QUANTITIES.map(q => (
                  <button key={q} onClick={() => { setQty(q); setCustomQty(''); }}
                    className={`py-3 rounded-xl font-semibold transition-all ${qty === q && !customQty ? 'bg-brand-blue text-white' : 'border border-white/10 text-gray-300 hover:border-brand-blue/40'}`}>
                    {q} পিস
                  </button>
                ))}
              </div>
              <input type="number" min="50" placeholder="Custom পরিমাণ (৫০+)"
                value={customQty} onChange={e => setCustomQty(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-blue focus:outline-none transition-all text-sm" />
            </div>

            {/* Price preview */}
            {!customQty && (
              <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">মোট মূল্য</p>
                  <p className="text-white text-2xl font-bold">{price.toLocaleString()}৳</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">৩০% অগ্রিম</p>
                  <p className="text-brand-blue text-2xl font-bold">{advance.toLocaleString()}৳</p>
                </div>
              </div>
            )}

            {/* Language */}
            <div>
              <p className="text-white font-semibold mb-3">কার্ডের ভাষা</p>
              <div className="grid grid-cols-2 gap-3">
                {[['bangla', '🇧🇩 বাংলা'], ['english', '🇬🇧 English']].map(([v, label]) => (
                  <button key={v} onClick={() => setLang(v)}
                    className={`py-3 rounded-xl font-semibold transition-all ${lang === v ? 'bg-brand-blue text-white' : 'border border-white/10 text-gray-300 hover:border-brand-blue/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Groom */}
            <div>
              <p className="text-white font-semibold mb-3">👰‍♂️ বর / Groom</p>
              <div className="space-y-3">
                <F label="নাম / Name" k="groomName" />
                <F label="পিতার নাম / Father's Name" k="groomFather" />
                <F label="মাতার নাম / Mother's Name" k="groomMother" />
                <F label="ঠিকানা / Address" k="groomAddress" />
              </div>
            </div>

            {/* Bride */}
            <div>
              <p className="text-white font-semibold mb-3">👰 কনে / Bride</p>
              <div className="space-y-3">
                <F label="নাম / Name" k="brideName" />
                <F label="পিতার নাম / Father's Name" k="brideFather" />
                <F label="মাতার নাম / Mother's Name" k="brideMother" />
                <F label="ঠিকানা / Address" k="brideAddress" />
              </div>
            </div>

            {/* Holud */}
            <div>
              <p className="text-white font-semibold mb-3">💛 গায়ে হলুদ / Holud</p>
              <div className="grid grid-cols-2 gap-3">
                <F label="তারিখ (ইং)" k="holudDateEn" placeholder="DD/MM/YYYY" />
                <F label="তারিখ (বাং)" k="holudDateBn" placeholder="০০/০০/০০০০" />
                <F label="রোজ / Day" k="holudDay" placeholder="শনিবার / Saturday" />
                <F label="সময় / Time" k="holudTime" placeholder="বিকেল ৪টা" />
              </div>
              <div className="mt-3">
                <F label="স্থান / Venue" k="holudVenue" />
              </div>
            </div>

            {/* Wedding */}
            <div>
              <p className="text-white font-semibold mb-3">💍 শুভ বিবাহ / Wedding</p>
              <div className="grid grid-cols-2 gap-3">
                <F label="তারিখ (ইং)" k="weddingDateEn" placeholder="DD/MM/YYYY" />
                <F label="তারিখ (বাং)" k="weddingDateBn" placeholder="০০/০০/০০০০" />
                <F label="রোজ / Day" k="weddingDay" />
                <F label="সময় / Time" k="weddingTime" />
              </div>
              <div className="mt-3 space-y-3">
                <F label="লগ্ন (হিন্দু বিবাহে)" k="weddingLagna" placeholder="Optional" />
                <F label="স্থান / Venue" k="weddingVenue" />
              </div>
            </div>

            {/* Reception */}
            <div>
              <p className="text-white font-semibold mb-3">🎉 বৌ-ভাত / Reception</p>
              <div className="grid grid-cols-2 gap-3">
                <F label="তারিখ (ইং)" k="receptionDateEn" placeholder="DD/MM/YYYY" />
                <F label="তারিখ (বাং)" k="receptionDateBn" placeholder="০০/০০/০০০০" />
                <F label="রোজ / Day" k="receptionDay" />
                <F label="সময় / Time" k="receptionTime" />
              </div>
              <div className="mt-3">
                <F label="স্থান / Venue" k="receptionVenue" />
              </div>
            </div>

            {/* Extra */}
            <div>
              <p className="text-white font-semibold mb-3">অতিরিক্ত তথ্য</p>
              <div className="space-y-3">
                <F label="অভ্যর্থনায় শিশুদের নাম" k="childrenNames" placeholder="Optional" />
                <F label="যোগাযোগ নম্বর" k="contactPhone" placeholder="01XXXXXXXXX" />
                <F label="শুভেচ্ছান্তে নাম" k="regardsName" />
                <div className="grid grid-cols-2 gap-3">
                  <F label="বর কততম সন্তান" k="groomChildNo" placeholder="যেমন: ১ম" />
                  <F label="কনে কততম সন্তান" k="brideChildNo" placeholder="যেমন: ২য়" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">কার্ড কোন পক্ষের?</label>
                  <select value={form.cardSide} onChange={e => update('cardSide', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-blue focus:outline-none transition-all text-sm">
                    <option value="" className="bg-brand-dark">বেছে নিন</option>
                    <option value="ছেলের" className="bg-brand-dark">ছেলের পক্ষ</option>
                    <option value="মেয়ের" className="bg-brand-dark">মেয়ের পক্ষ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courier */}
            <div>
              <p className="text-white font-semibold mb-3">🚚 কুরিয়ার তথ্য</p>
              <div className="space-y-3">
                <F label="নাম / Name" k="courierName" />
                <F label="মোবাইল / Phone" k="courierPhone" placeholder="01XXXXXXXXX" />
                <F label="সম্পূর্ণ ঠিকানা / Full Address" k="courierAddress" />
              </div>
            </div>

            {/* Payment reminder */}
            <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-4">
              <p className="text-brand-gold font-semibold mb-1">💳 পেমেন্ট নির্দেশনা</p>
              <p className="text-gray-400 text-sm">bKash / Nagad / Rocket: <span className="text-white font-mono">01682588856</span></p>
              <p className="text-gray-400 text-sm">WhatsApp পাঠানোর পর ৩০% অগ্রিম পাঠিয়ে দিন।</p>
            </div>

            <button onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2">
              📱 WhatsApp-এ পাঠান
            </button>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </div>
    </>
  );
}