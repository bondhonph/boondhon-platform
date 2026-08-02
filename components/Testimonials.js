import { useState } from 'react';
import { Star, MapPin, CheckCircle, Heart, Image as ImageIcon } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'মো: তানভীর ও ফারহানা',
    area: 'মানিকগঞ্জ সদর',
    rating: 5,
    cardType: 'Premium Royal (২০০ পিস)',
    date: 'জুলাই ২০২৬',
    quote: 'বন্ধন প্রিন্টিং হাউসের কার্ডের ফয়েল প্রিন্টিং আর কাগজের কোয়ালিটি রাজকীয়! ডেমো দেখে কনফার্ম করার মাত্র ৫ দিনের মধ্যে ডেলিভারি পেয়েছি। ২০০+ পিসে ফ্রি নিকাহনামাটা অসাধারণ হয়েছে! ❤️',
    deliveredPhoto: 'https://lh3.googleusercontent.com/d/182kOjBhoaqOTq7nr4ryI6re6fRuLITbH'
  },
  {
    id: 2,
    name: 'সাবরিনা পারভীন',
    area: 'সাভার, ঢাকা',
    rating: 5,
    cardType: 'Affordable Card (১০০ পিস)',
    date: 'জুন ২০২৬',
    quote: 'খুবই কম খরচে এত সুন্দর ফিনিশিং পাব ভাবিনি। বরের বাড়ির সবাই কার্ড পছন্দ করেছে। অনলাইনে WhatsApp-এ তথ্য দিয়ে নিশ্চিন্তে অর্ডার করতে পেরেছি।',
    deliveredPhoto: 'https://lh3.googleusercontent.com/d/1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD'
  },
  {
    id: 3,
    name: 'মেহেদী হাসান ও রাফেজা',
    area: 'সিংগাইর, মানিকগঞ্জ',
    rating: 5,
    cardType: 'Premium Gold (১৫০ পিস)',
    date: 'মে ২০২৬',
    quote: 'অনন্যা আপুর কাস্টমার সার্ভিস চমৎকার! প্রতিটি বানান তারা খুব মনোযোগ দিয়ে চেক করে প্রিন্ট দিয়েছে। মানিকগঞ্জে এর চেয়ে ভালো প্রিন্টিং হাউস নেই।',
    deliveredPhoto: 'https://lh3.googleusercontent.com/d/1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj'
  },
  {
    id: 4,
    name: 'ইঞ্জিনিয়ার আরিফুল ইসলাম',
    area: 'গাজীপুর',
    rating: 5,
    cardType: 'Affordable Card (২০০ পিস)',
    date: 'এপ্রিল ২০২৬',
    quote: 'কুরিয়ারে কার্ড অক্ষত অবস্থায় পেয়েছি। প্যাকেজিং ও প্রিন্ট কোয়ালিটি ১০০ তে ১০০। সবাইকে বন্ধন প্রিন্টিং হাউস রেকমেন্ড করছি।',
    deliveredPhoto: 'https://lh3.googleusercontent.com/d/1dbYH2L4QykEUhYXGQPzQZObEuHFdwKsT'
  }
];

const DELIVERED_GALLERY = [
  { id: 1, title: 'প্রিন্টকৃত রাজকীয় ফয়েল কার্ড', loc: 'মানিকগঞ্জ', url: 'https://lh3.googleusercontent.com/d/182kOjBhoaqOTq7nr4ryI6re6fRuLITbH' },
  { id: 2, title: 'সাশ্রয়ী কাস্টম ডিজাইন বিয়ের কার্ড', loc: 'ঢাকা', url: 'https://lh3.googleusercontent.com/d/1J9_qfkIdIWL5Sc9O8EokvYlGfQWrf5TD' },
  { id: 3, title: '২০০+ পিসের সাথে প্রাপ্ত ফ্রি প্রিমিয়াম নিকাহনামা', loc: 'সাভার', url: 'https://lh3.googleusercontent.com/d/1cTfbTDJDqBjsV-r7V1OjBZ-Z6tUAqwxj' },
  { id: 4, title: 'প্রিমিয়াম ভেলভেট ফিনিশিং ওয়েডিং কার্ড', loc: 'গাজীপুর', url: 'https://lh3.googleusercontent.com/d/1cA-MfI55Hh7ibreMQ4zPvt2i_LKxVHkR' }
];

export default function Testimonials() {
  const [activeImg, setActiveImg] = useState(null);

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-1 mb-2">
          <Heart size={14} className="text-red-400 fill-red-400" /> গ্রাহকদের আস্থা ও মতামত
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          ৫০০+ সন্তুষ্ট গ্রাহকের ভালোবাসা 🌸
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          মানিকগঞ্জ ও সারা বাংলাদেশের সম্মানীত গ্রাহকদের মতামত এবং আমাদের প্রিন্টকৃত আসল বিয়ের কার্ডের ঝলক।
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {TESTIMONIALS.map((t) => (
          <div key={t.id} className="glass rounded-3xl p-6 md:p-8 hover:border-brand-gold/40 transition-all border border-white/5 flex flex-col justify-between group">
            <div>
              {/* Rating & Card Tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <span className="text-[11px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full font-semibold">
                  {t.cardType}
                </span>
              </div>

              {/* Quote */}
              <p className="text-gray-200 text-sm md:text-base leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
            </div>

            {/* Customer Info & Photo */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                    {t.name} <CheckCircle size={14} className="text-green-400" />
                  </h4>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <MapPin size={12} className="text-brand-blue" /> {t.area} · <span className="text-gray-500">{t.date}</span>
                  </p>
                </div>
              </div>

              {t.deliveredPhoto && (
                <img
                  src={t.deliveredPhoto}
                  alt={`Delivered card for ${t.name}`}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => setActiveImg(t.deliveredPhoto)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivered Real Printed Cards Gallery */}
      <div className="glass rounded-3xl p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold font-display text-white flex items-center gap-2">
              <ImageIcon className="text-brand-blue" size={24} />
              <span>ডেলিভারিকৃত আসল ফিনিশিং কার্ডের গ্যালারি</span>
            </h3>
            <p className="text-gray-400 text-xs mt-1">প্রিন্ট হওয়ার পর গ্রাহকের হাতে পৌঁছানো আসল ওয়েডিং কার্ডের ছবি</p>
          </div>
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-1.5 rounded-full font-semibold">
            ১০০% অরিজিনাল প্রিন্ট কোয়ালিটি
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DELIVERED_GALLERY.map((item) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10" onClick={() => setActiveImg(item.url)}>
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] text-brand-gold font-semibold uppercase">{item.loc}</span>
                <p className="text-white text-xs font-bold leading-snug">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActiveImg(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveImg(null)} className="absolute -top-10 right-0 text-white text-2xl">✕</button>
            <img src={activeImg} alt="Delivered photo" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </section>
  );
}
