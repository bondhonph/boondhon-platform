import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { getCardByCode } from '../lib/data';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, ShoppingBag, Truck, CreditCard, Sparkles, Image as ImageIcon } from 'lucide-react';

const QUANTITIES = [50, 100, 200];

export default function Order() {
  const router = useRouter();
  const [lang, setLang] = useState('bangla');
  const [qty, setQty] = useState(50);
  const [customQty, setCustomQty] = useState('');
  const [tier, setTier] = useState('affordable');
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);

  // Collapsible accordion states for events
  const [openHolud, setOpenHolud] = useState(false);
  const [openWedding, setOpenWedding] = useState(true);
  const [openReception, setOpenReception] = useState(false);

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

  // Handle Query Params for Design Handoff (Priority 1)
  useEffect(() => {
    if (!router.isReady) return;
    const { design, type } = router.query;
    if (design) {
      const card = getCardByCode(design);
      if (card) {
        setSelectedCard(card);
        setTier(card.type);
      }
    } else if (type === 'premium') {
      setTier('premium');
    }
  }, [router.isReady, router.query]);

  // Draft persistence from localStorage (Priority 4)
  useEffect(() => {
    try {
      const draft = localStorage.getItem('boondhon_order_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.form) setForm(parsed.form);
        if (parsed.qty) setQty(parsed.qty);
        if (parsed.tier) setTier(parsed.tier);
        if (parsed.lang) setLang(parsed.lang);
        setDraftSaved(true);
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  }, []);

  // Save draft on form updates
  const update = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      try {
        localStorage.setItem('boondhon_order_draft', JSON.stringify({ form: next, qty, tier, lang }));
        setDraftSaved(true);
      } catch (e) {}
      return next;
    });
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: null }));
    }
  };

  const finalQty = (customQty && !isNaN(parseInt(customQty))) ? Math.max(1, parseInt(customQty)) : qty;

  const calculatePrice = (q, t) => {
    if (q === 50) return t === 'premium' ? 3250 : 2750;
    if (q === 100) return t === 'premium' ? 5500 : 4500;
    if (q === 200) return t === 'premium' ? 9000 : 7000;
    
    const rate = t === 'premium' 
      ? (q < 100 ? 65 : q < 200 ? 55 : 45)
      : (q < 100 ? 55 : q < 200 ? 45 : 35);
    return q * rate;
  };

  const price = calculatePrice(finalQty, tier);
  const advance = Math.ceil(price * 0.3);

  // Validate required fields before submitting
  const validateForm = () => {
    const newErrors = {};
    if (!form.groomName && !form.brideName) {
      newErrors.groomName = 'বর বা কনের যেকোনো একটি নাম পূরণ করুন';
    }
    if (!form.contactPhone && !form.courierPhone) {
      newErrors.contactPhone = 'মোবাইল নম্বর প্রদান করা আবশ্যক';
    }
    if (!form.courierAddress) {
      newErrors.courierAddress = 'ডেলিভারি ঠিকানা প্রদান করুন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setActiveStep(1); // Jump back to step 1/4 to fix errors
      return;
    }

    const selectedQty = customQty || qty;
    const cardDesignInfo = selectedCard ? `🎨 ডিজাইন কোড: ${selectedCard.code}\n` : '';

    let msg = lang === 'bangla'
      ? `📝 *BOONDHON বিয়ের কার্ড অর্ডার* 🌸\n\n`
        + cardDesignInfo
        + `📦 পরিমাণ: ${selectedQty} পিস\n`
        + `💎 ধরন: ${tier === 'premium' ? 'Premium' : 'Affordable'}\n\n`
        + `👰‍♂️ *বর-*\nনাম: ${form.groomName}\nপিতা: ${form.groomFather}\nমাতা: ${form.groomMother}\nঠিকানা: ${form.groomAddress}\n\n`
        + `👰 *কনে-*\nনাম: ${form.brideName}\nপিতা: ${form.brideFather}\nমাতা: ${form.brideMother}\nঠিকানা: ${form.brideAddress}\n\n`
        + `💛 *গায়ে হলুদ-*\nতারিখ (ইং): ${form.holudDateEn}\nতারিখ (বাং): ${form.holudDateBn}\nরোজ: ${form.holudDay}\nসময়: ${form.holudTime}\nস্থান: ${form.holudVenue}\n\n`
        + `💍 *শুভ বিবাহ-*\nতারিখ (ইং): ${form.weddingDateEn}\nতারিখ (বাং): ${form.weddingDateBn}\nরোজ: ${form.weddingDay}\nলগ্ন: ${form.weddingLagna}\nসময়: ${form.weddingTime}\nস্থান: ${form.weddingVenue}\n\n`
        + `🎉 *বৌ-ভাত-*\nতারিখ (ইং): ${form.receptionDateEn}\nতারিখ (বাং): ${form.receptionDateBn}\nরোজ: ${form.receptionDay}\nসময়: ${form.receptionTime}\nস্থান: ${form.receptionVenue}\n\n`
        + `শিশু: ${form.childrenNames}\nযোগাযোগ: ${form.contactPhone}\nশুভেচ্ছান্তে: ${form.regardsName}\n\n`
        + `বর কততম সন্তান: ${form.groomChildNo}\nকনে কততম সন্তান: ${form.brideChildNo}\nকার্ড: ${form.cardSide} পক্ষ\n\n`
        + `🚚 *কুরিয়ার:*\nনাম: ${form.courierName || form.groomName || form.brideName}\nমোবাইল: ${form.courierPhone || form.contactPhone}\nঠিকানা: ${form.courierAddress}`
      : `📝 *BOONDHON Wedding Card Order* 🌸\n\n`
        + cardDesignInfo
        + `📦 Quantity: ${selectedQty} pcs\n💎 Type: ${tier === 'premium' ? 'Premium' : 'Affordable'}\n\n`
        + `👰‍♂️ *Groom:*\nName: ${form.groomName}\nFather: ${form.groomFather}\nMother: ${form.groomMother}\n\n`
        + `👰 *Bride:*\nName: ${form.brideName}\nFather: ${form.brideFather}\nMother: ${form.brideMother}\n\n`
        + `💛 *Holud:*\nDay: ${form.holudDay}, Date: ${form.holudDateEn}\nTime: ${form.holudTime}, Venue: ${form.holudVenue}\n\n`
        + `💍 *Wedding:*\nDay: ${form.weddingDay}, Date: ${form.weddingDateEn}\nTime: ${form.weddingTime}, Venue: ${form.weddingVenue}\n\n`
        + `🎉 *Reception:*\nDay: ${form.receptionDay}, Date: ${form.receptionDateEn}\nTime: ${form.receptionTime}, Venue: ${form.receptionVenue}\n\n`
        + `RSVP: ${form.contactPhone}, Regards: ${form.regardsName}\n\n`
        + `🚚 *Courier:*\nName: ${form.courierName || form.groomName}, Phone: ${form.courierPhone || form.contactPhone}\nAddress: ${form.courierAddress}`;

    // Save order details to local inbox for Admin Dashboard
    try {
      const inboxMessage = {
        id: Date.now(),
        name: form.groomName || form.brideName || 'নতুন অর্ডার',
        phone: form.contactPhone || form.courierPhone || '01700000000',
        card: `${tier === 'premium' ? 'Premium' : 'Affordable'} (${selectedCard ? selectedCard.code + ' - ' : ''}${selectedQty} পিস)`,
        time: 'এখনই',
        msg: `অনলাইন অর্ডার ফরম জমা পড়েছে। মোট বিল: ${price}৳ (৩০% বুকিং: ${advance}৳)`,
        status: 'New'
      };
      const existing = JSON.parse(localStorage.getItem('boondhon_customer_inbox') || '[]');
      localStorage.setItem('boondhon_customer_inbox', JSON.stringify([inboxMessage, ...existing]));
    } catch (e) {}

    // Clear saved draft on successful submit
    try { localStorage.removeItem('boondhon_order_draft'); } catch (e) {}

    // Generate unique Event ID for Deduplication
    const eventId = 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    // Track Meta Pixel Conversion (Browser-side Lead Event)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        value: price,
        currency: 'BDT',
        content_name: `${tier === 'premium' ? 'Premium' : 'Affordable'} Card Order`,
        num_items: Number(selectedQty)
      }, { eventID: eventId });
    }

    // Send Meta Conversions API (Server-side Event)
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Lead',
        value: price,
        currency: 'BDT',
        orderId: eventId,
        phone: form.contactPhone || form.courierPhone,
        url: window.location.href
      })
    }).catch(err => console.error('CAPI Call Error:', err));

    const url = `https://wa.me/8801863586302?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const F = ({ label, k, placeholder, type = 'text', required = false }) => (
    <div>
      <label className="block text-gray-400 text-sm mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} placeholder={placeholder || label}
        value={form[k]} onChange={e => update(k, e.target.value)}
        className={`w-full bg-white/5 border ${errors[k] ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-blue focus:outline-none focus:bg-white/8 transition-all text-sm`} />
      {errors[k] && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors[k]}</p>}
    </div>
  );

  return (
    <>
      <Head>
        <title>অর্ডার করুন | BOONDHON Printing House</title>
        <meta name="description" content="BOONDHON Printing House-এর অনলাইন বিয়ের কার্ড অর্ডার ফর্ম। ৩০% অগ্রিম পেমেন্টে ডেমো দেখে অর্ডার সুনিশ্চিত করুন।" />
        <meta property="og:title" content="অনলাইন বিয়ের কার্ড অর্ডার – BOONDHON Printing House" />
        <meta property="og:description" content="সহজে বিয়ের কার্ড অর্ডার করুন। ৫-৭ কর্মদিবসের মধ্যে সারা দেশে ডেলিভারি।" />
        <meta property="og:image" content="https://lh3.googleusercontent.com/d/1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD" />
      </Head>

      <div className="min-h-screen bg-brand-dark">
        <Navbar />

        <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-2">অর্ডার করুন</h1>
            <p className="text-gray-400 text-sm">সহজ ৪টি ধাপে বিবরণ পূরণ করুন — সরাসরি WhatsApp-এ জমা হবে</p>
          </div>

          {/* Draft Saved Indicator */}
          {draftSaved && (
            <div className="mb-6 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue p-3 rounded-2xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> আপনার পূর্ববর্তী টাইপ করা তথ্য ড্রাফট হিসেবে সেভ রয়েছে।</span>
              <button onClick={() => { localStorage.removeItem('boondhon_order_draft'); setForm({ groomName: '', brideName: '', contactPhone: '', courierAddress: '' }); setDraftSaved(false); }}
                className="text-gray-400 hover:text-white underline">মুছে ফেলুন</button>
            </div>
          )}

          {/* Progress Indicator (Priority 4) */}
          <div className="mb-8 glass p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
              <span>ধাপ {activeStep} / ৪: {
                activeStep === 1 ? 'কার্ড নির্বাচন ও পরিমাণ' :
                activeStep === 2 ? 'বর ও কনের বিবরণ' :
                activeStep === 3 ? 'অনুষ্ঠানের সময়সূচী' : 'কুরিয়ার ও পেমেন্ট'
              }</span>
              <span className="text-brand-blue font-bold">{activeStep * 25}% সম্পন্ন</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-brand-blue to-blue-400 h-full transition-all duration-300" style={{ width: `${activeStep * 25}%` }}></div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">

            {/* STEP 1: CARD TYPE & QUANTITY */}
            <div className={`border rounded-2xl p-5 transition-all ${activeStep === 1 ? 'border-brand-blue/50 bg-white/3' : 'border-white/10 bg-white/1'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveStep(1)}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 1 ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-400'}`}>১</span>
                  <h3 className="text-white font-bold text-lg">কার্ডের ধরণ ও পরিমাণ</h3>
                </div>
                {activeStep === 1 ? <ChevronUp size={20} className="text-brand-blue" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>

              {activeStep === 1 && (
                <div className="mt-6 space-y-6 pt-4 border-t border-white/5">
                  {/* Selected Design Preview Handoff (Priority 1) */}
                  {selectedCard ? (
                    <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-2xl p-4 flex items-center gap-4">
                      <img src={selectedCard.driveUrl} alt={selectedCard.code} className="w-16 h-16 object-cover rounded-xl border border-white/20" />
                      <div className="flex-1">
                        <span className="text-[10px] bg-brand-blue text-white font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                          পছন্দকৃত ডিজাইন
                        </span>
                        <h4 className="text-white font-bold text-base mt-1">ডিজাইন কোড: {selectedCard.code}</h4>
                        <p className="text-gray-400 text-xs capitalize">ক্যাটাগরি: {selectedCard.type}</p>
                      </div>
                      <Link href="/products" className="text-xs text-brand-blue underline hover:text-white">
                        পরিবর্তন করুন
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-xs text-gray-400">
                      <span>কার্ড গ্যালারি থেকে পছন্দের ডিজাইন সিলেক্ট করেননি?</span>
                      <Link href="/products" className="text-brand-blue hover:underline font-bold flex items-center gap-1">
                        <ImageIcon size={14} /> গ্যালারি দেখুন →
                      </Link>
                    </div>
                  )}

                  {/* Language */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">কার্ডের ভাষা (Language)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[['bangla', 'বাংলা'], ['english', 'English']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setLang(v)}
                          className={`py-3 rounded-xl border font-semibold text-sm transition-all ${lang === v ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tier */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">কার্ড ক্যাটাগরি</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['affordable', '🌸 Affordable', '৫০পিস ২,৭৫০৳ থেকে'],
                        ['premium', '✨ Premium', '৫০পিস ৩,২৫০৳ থেকে']
                      ].map(([v, label, sub]) => (
                        <button key={v} type="button" onClick={() => setTier(v)}
                          className={`p-4 rounded-xl border text-left transition-all ${tier === v ? 'bg-brand-blue/20 border-brand-blue text-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                          <p className="font-bold text-sm text-white mb-1">{label}</p>
                          <p className="text-xs text-gray-400">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">পরিমাণ (সর্বনিম্ন ৫০ পিস)</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {QUANTITIES.map(q => (
                        <button key={q} type="button" onClick={() => { setQty(q); setCustomQty(''); }}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${qty === q && !customQty ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                          {q} পিস
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={() => setActiveStep(2)} className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-all text-sm">
                    পরবর্তী ধাপ: বর ও কনের তথ্য →
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: GROOM & BRIDE DETAILS */}
            <div className={`border rounded-2xl p-5 transition-all ${activeStep === 2 ? 'border-brand-blue/50 bg-white/3' : 'border-white/10 bg-white/1'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveStep(2)}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 2 ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-400'}`}>২</span>
                  <h3 className="text-white font-bold text-lg">বর ও কনের বিবরণ</h3>
                </div>
                {activeStep === 2 ? <ChevronUp size={20} className="text-brand-blue" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>

              {activeStep === 2 && (
                <div className="mt-6 space-y-6 pt-4 border-t border-white/5">
                  {/* Groom */}
                  <div className="bg-white/3 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-brand-blue font-bold text-sm">👰‍♂️ বরের তথ্য</h4>
                    <F label="বরের নাম" k="groomName" placeholder="যেমন: তানভীর আহমেদ" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <F label="বরের পিতার নাম" k="groomFather" />
                      <F label="বরের মাতার নাম" k="groomMother" />
                    </div>
                    <F label="বরের ঠিকানা" k="groomAddress" placeholder="যেমন: গ্রাম, ডাকঘর, উপজেলা, জেলা" />
                  </div>

                  {/* Bride */}
                  <div className="bg-white/3 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-brand-gold font-bold text-sm">👰 কনের তথ্য</h4>
                    <F label="কনের নাম" k="brideName" placeholder="যেমন: সাবরিনা ইসলাম" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <F label="কনের পিতার নাম" k="brideFather" />
                      <F label="কনের মাতার নাম" k="brideMother" />
                    </div>
                    <F label="কনের ঠিকানা" k="brideAddress" placeholder="যেমন: গ্রাম, ডাকঘর, উপজেলা, জেলা" />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setActiveStep(1)} className="w-1/3 border border-white/20 text-white font-semibold py-3 rounded-xl text-sm">
                      ← পূর্ববর্তী
                    </button>
                    <button type="button" onClick={() => setActiveStep(3)} className="w-2/3 bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-all text-sm">
                      পরবর্তী ধাপ: অনুষ্ঠানের সময়সূচী →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: EVENT DETAILS (Collapsible Holud/Wedding/Reception) */}
            <div className={`border rounded-2xl p-5 transition-all ${activeStep === 3 ? 'border-brand-blue/50 bg-white/3' : 'border-white/10 bg-white/1'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveStep(3)}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 3 ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-400'}`}>৩</span>
                  <h3 className="text-white font-bold text-lg">অনুষ্ঠানের সময়সূচী</h3>
                </div>
                {activeStep === 3 ? <ChevronUp size={20} className="text-brand-blue" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>

              {activeStep === 3 && (
                <div className="mt-6 space-y-4 pt-4 border-t border-white/5">

                  {/* Wedding Event (Open by default) */}
                  <div className="border border-brand-blue/30 rounded-2xl overflow-hidden bg-slate-900/50">
                    <button type="button" onClick={() => setOpenWedding(!openWedding)}
                      className="w-full p-4 flex justify-between items-center bg-brand-blue/10 text-white font-bold text-sm">
                      <span>💍 শুভ বিবাহ সময়সূচী (প্রধান অনুষ্ঠান)</span>
                      {openWedding ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openWedding && (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <F label="তারিখ (ইংরেজি)" k="weddingDateEn" placeholder="যেমন: ২৫ ডিসেম্বর ২০২৬" />
                          <F label="তারিখ (বাংলা)" k="weddingDateBn" placeholder="যেমন: ১০ পৌষ ১৪৩৩" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <F label="রোজ / বার" k="weddingDay" placeholder="যেমন: শুক্রবার" />
                          <F label="সময়" k="weddingTime" placeholder="যেমন: বেলা ২:০০ ঘটিকায়" />
                          <F label="লগ্ন" k="weddingLagna" placeholder="যেমন: শুভলগ্নে" />
                        </div>
                        <F label="স্থান / ভেন্যু" k="weddingVenue" placeholder="যেমন: রাজকীয় কমিউনিটি সেন্টার, মানিকগঞ্জ" />
                      </div>
                    )}
                  </div>

                  {/* Holud Event (Collapsible) */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/30">
                    <button type="button" onClick={() => setOpenHolud(!openHolud)}
                      className="w-full p-4 flex justify-between items-center text-gray-300 font-semibold text-sm hover:bg-white/5">
                      <span>💛 গায়ে হলুদ সময়সূচী (ঐচ্ছিক)</span>
                      {openHolud ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openHolud && (
                      <div className="p-4 space-y-3 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-3">
                          <F label="তারিখ (ইংরেজি)" k="holudDateEn" />
                          <F label="তারিখ (বাংলা)" k="holudDateBn" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <F label="রোজ / বার" k="holudDay" />
                          <F label="সময়" k="holudTime" />
                        </div>
                        <F label="স্থান / ভেন্যু" k="holudVenue" />
                      </div>
                    )}
                  </div>

                  {/* Reception Event (Collapsible) */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/30">
                    <button type="button" onClick={() => setOpenReception(!openReception)}
                      className="w-full p-4 flex justify-between items-center text-gray-300 font-semibold text-sm hover:bg-white/5">
                      <span>🎉 বৌ-ভাত সময়সূচী (ঐচ্ছিক)</span>
                      {openReception ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openReception && (
                      <div className="p-4 space-y-3 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-3">
                          <F label="তারিখ (ইংরেজি)" k="receptionDateEn" />
                          <F label="তারিখ (বাংলা)" k="receptionDateBn" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <F label="রোজ / বার" k="receptionDay" />
                          <F label="সময়" k="receptionTime" />
                        </div>
                        <F label="স্থান / ভেন্যু" k="receptionVenue" />
                      </div>
                    )}
                  </div>

                  {/* Additional info */}
                  <div className="bg-white/3 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-gray-300 font-bold text-sm">অতিরিক্ত তথ্যাদি</h4>
                    <F label="যোগাযোগের মোবাইল নম্বর" k="contactPhone" placeholder="যেমন: 01712345678" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <F label="শুভেচ্ছান্তে নাম" k="regardsName" placeholder="যেমন: রফিকুল ইসলাম ও পরিবার" />
                      <F label="ছোটদের নাম (যদি থাকে)" k="childrenNames" placeholder="যেমন: অয়ন, মাইশা" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setActiveStep(2)} className="w-1/3 border border-white/20 text-white font-semibold py-3 rounded-xl text-sm">
                      ← পূর্ববর্তী
                    </button>
                    <button type="button" onClick={() => setActiveStep(4)} className="w-2/3 bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-all text-sm">
                      শেষ ধাপ: কুরিয়ার ও পেমেন্ট →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: COURIER & PAYMENT */}
            <div className={`border rounded-2xl p-5 transition-all ${activeStep === 4 ? 'border-brand-blue/50 bg-white/3' : 'border-white/10 bg-white/1'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveStep(4)}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 4 ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-400'}`}>৪</span>
                  <h3 className="text-white font-bold text-lg">কুরিয়ার ঠিকানা ও পেমেন্ট</h3>
                </div>
                {activeStep === 4 ? <ChevronUp size={20} className="text-brand-blue" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>

              {activeStep === 4 && (
                <div className="mt-6 space-y-6 pt-4 border-t border-white/5">
                  <div className="bg-white/3 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-brand-blue font-bold text-sm flex items-center gap-2">
                      <Truck size={16} /> কুরিয়ার ডেলিভারি ঠিকানা
                    </h4>
                    <F label="প্রাপকের নাম" k="courierName" placeholder="যেমন: তানভীর আহমেদ" />
                    <F label="প্রাপকের মোবাইল নম্বর" k="courierPhone" placeholder="যেমন: 01712345678" />
                    <F label="পূর্ণাঙ্গ ডেলিভারি ঠিকানা" k="courierAddress" placeholder="যেমন: বাসা/রোড নম্বর, থানা, জেলা" required />
                  </div>

                  {/* Summary & Payment Card */}
                  <div className="bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 border border-brand-blue/20 p-6 rounded-2xl space-y-3">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <CreditCard size={18} className="text-brand-gold" /> বিলের সারসংক্ষেপ
                    </h4>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>কার্ডের ধরণ:</span>
                      <span className="text-white font-semibold capitalize">{tier} ({finalQty} পিস)</span>
                    </div>
                    {selectedCard && (
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>ডিজাইন কোড:</span>
                        <span className="text-brand-gold font-mono font-bold">{selectedCard.code}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                      <span>সর্বমোট বিল:</span>
                      <span className="text-brand-blue text-xl">{price} ৳</span>
                    </div>
                    <div className="flex justify-between text-xs text-brand-gold font-semibold">
                      <span>৩০% অগ্রিম বুকিং পেমেন্ট:</span>
                      <span>{advance} ৳</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      💳 বিকাশ/নগদ/রকেট পারসোনাল নম্বর: <strong className="text-white">01682588856</strong> (৩০% বুকিং ফি দিয়ে ডেমো প্রিন্ট কনফার্ম করুন)।
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setActiveStep(3)} className="w-1/3 border border-white/20 text-white font-semibold py-3 rounded-xl text-sm">
                      ← পূর্ববর্তী
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-2/3 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:shadow-brand-blue/40 transition-all text-base flex items-center justify-center gap-2">
                      <span>অর্ডার জমা দিন (WhatsApp)</span> 🌸
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        <Footer />
        <Chatbot />
      </div>
    </>
  );
}
