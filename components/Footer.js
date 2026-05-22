import Link from 'next/link';
import { Phone, MapPin, Facebook, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-brand-blue/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <div className="w-6 h-6 rounded-full border-2 border-brand-gold absolute left-0 top-2"></div>
                <div className="w-6 h-6 rounded-full border-2 border-brand-blue absolute right-0 top-2"></div>
              </div>
              <div>
                <p className="text-xl font-display font-bold text-white">BOONDHON</p>
                <p className="text-xs text-brand-blue">Printing House</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">বাংলাদেশের সেরা ওয়েডিং কার্ড প্রিন্টিং হাউস।</p>
            <p className="text-brand-blue font-display italic text-lg mt-3">"Design Your Dream"</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-display">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'হোম'], ['/products', 'কার্ড গ্যালারি'], ['/pricing', 'মূল্য তালিকা'], ['/order', 'অর্ডার করুন']].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-gray-400 hover:text-brand-blue transition-colors text-sm">→ {label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 font-display">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:01701016826" className="flex items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors"><Phone size={14} className="text-brand-blue" />01701016826</a></li>
              <li><a href="https://wa.me/8801701016826" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"><MessageCircle size={14} className="text-green-400" />WhatsApp</a></li>
              <li><a href="https://maps.app.goo.gl/CnyRST5KxHjWDAtd9" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors"><MapPin size={14} className="text-brand-blue" />মানিকগঞ্জ</a></li>
              <li><a href="https://www.facebook.com/bondhonbph" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"><Facebook size={14} className="text-blue-400" />Facebook Page</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-blue/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2025 BOONDHON Printing House. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-gray-600 text-xs flex items-center gap-1">Made with <Heart size={12} className="text-red-400" /> in মানিকগঞ্জ</p>
        </div>
      </div>
    </footer>
  );
}