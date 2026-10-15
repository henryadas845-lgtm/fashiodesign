import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import logoImg from '../assets/images/brand_logo_1783831948374.jpg';
import { subscribeToNewsletter } from '../lib/supabase';

const TikTokIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    setNewsletterStatus('idle');

    try {
      // 1. Send to Supabase directly
      await subscribeToNewsletter(newsletterEmail);
      // 2. Also backup to server API
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      setNewsletterStatus('error');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-100">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 text-2xl font-serif font-bold tracking-widest text-text-dark mb-6">
              <img src={logoImg} alt="ADA'S HENRY Logo" referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded-sm" />
              <div>ADA'S <span className="text-primary">HENRY</span></div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Elevating women's luxury fashion with premium shoes, handbags, and clothing designed for elegance and timeless beauty.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-500 hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link to="/vision" className="text-gray-500 hover:text-primary transition-colors text-sm">Our Vision</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-primary transition-colors text-sm">Shop Collection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <span>123 Luxury Avenue, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 group">
                <Phone size={18} className="text-accent shrink-0 group-hover:text-primary transition-colors" />
                <a href="tel:+2349067566746" className="group-hover:text-primary hover:-translate-y-0.5 transition-all duration-300 inline-block">+234 906 756 6746</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 group">
                <Mail size={18} className="text-accent shrink-0 group-hover:text-primary transition-colors" />
                <a href="mailto:adaolowohenry1998@gmail.com" className="group-hover:text-primary hover:-translate-y-0.5 transition-all duration-300 inline-block">adaolowohenry1998@gmail.com</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Newsletter</h4>
            <p className="text-gray-500 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            {newsletterStatus === 'success' ? (
              <div className="p-3 bg-pink-50 border border-pink-100 rounded-md text-xs text-primary font-medium">
                Thank you for subscribing to ADA'S HENRY!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  className="px-4 py-3 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                />
                <button 
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-4 py-3 bg-text-dark text-white text-sm uppercase tracking-wider font-medium hover:bg-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-md disabled:opacity-60"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
                {newsletterStatus === 'error' && (
                  <p className="text-red-500 text-xs">Could not subscribe. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ADA'S HENRY. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-text-dark transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-dark transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
