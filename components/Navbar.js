import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { href: '/', label: 'হোম' },
    { href: '/products', label: 'কার্ড গ্যালারি' },
    { href: '/pricing', label: 'মূল্য তালিকা' },
    { href: '/order', label: 'অর্ডার' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-brand-gold absolute left-0"></div>
              <div className="w-6 h-6 rounded-full border-2 border-brand-blue absolute right-0"></div>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-white tracking-widest">BOONDHON</p>
              <p className="text-xs text-brand-blue -mt-1">Printing House</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="nav-link text-gray-300 text-sm font-medium">{l.label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:01701016826" className="flex items-center gap-2 text-sm text-brand-blue border border-brand-blue/30 px-4 py-2 rounded-full hover:bg-brand-blue/10 transition-all">
              <Phone size={14} />01701016826
            </a>
            <Link href="/order" className="bg-gradient-to-r from-brand-blue to-blue-400 text-white text-sm px-5 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-brand-blue/30 transition-all">
              অর্ডার করুন
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-dark border-t border-brand-blue/10">
          <div className="px-4 py-4 space-y-3">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block text-gray-300 py-2 border-b border-white/5">{l.label}</Link>
            ))}
            <Link href="/order" onClick={() => setOpen(false)}
              className="block w-full text-center bg-gradient-to-r from-brand-blue to-blue-400 text-white py-3 rounded-full font-semibold mt-3">
              অর্ডার করুন 🌸
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}