import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { submitContactInquiry } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Submit to Supabase directly
      await submitContactInquiry(formData.name, formData.email, formData.message);

      // 2. Also backup to server API
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to send message. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" className="w-full">
      <section className="py-20 bg-pink-50/30 border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-dark mb-4">Contact Us</h1>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <motion.div variants={fadeIn} className="space-y-12">
              <div>
                <h2 className="text-2xl font-serif font-bold text-text-dark mb-4">Get in Touch</h2>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  We are here to assist you with any inquiries regarding our luxury collections, orders, or styling advice.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-text-dark mb-1">Our Location</h4>
                    <p className="text-gray-600 text-sm">123 Luxury Avenue<br/>Lagos, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-text-dark mb-1">Phone Number</h4>
                    <a href="tel:+2349067566746" className="text-gray-600 text-sm hover:text-primary transition-colors inline-block hover:-translate-y-0.5 duration-300">+234 906 756 6746</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-text-dark mb-1">Email Address</h4>
                    <a href="mailto:adaolowohenry1998@gmail.com" className="text-gray-600 text-sm hover:text-primary transition-colors inline-block hover:-translate-y-0.5 duration-300">adaolowohenry1998@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-text-dark mb-1">Business Hours</h4>
                    <p className="text-gray-600 text-sm">Monday - Saturday: 9:00 AM - 6:00 PM<br/>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <a href="https://wa.me/2349067566746" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-sm font-medium text-sm hover:bg-[#1EBE5D] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeIn} className="bg-gray-50 p-8 md:p-10 rounded-sm shadow-sm">
              <h3 className="text-xl font-serif font-bold text-text-dark mb-6">Send a Message</h3>
              
              {submitted ? (
                <div className="p-8 text-center bg-white border border-pink-100 rounded-sm space-y-4">
                  <CheckCircle2 size={48} className="text-primary mx-auto" />
                  <h4 className="text-xl font-serif font-bold text-text-dark">Message Sent!</h4>
                  <p className="text-gray-600 text-sm">
                    Thank you for reaching out to ADA'S HENRY. Your message has been saved and our concierge team will respond shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-text-dark text-white text-xs uppercase tracking-wider font-medium hover:bg-primary transition-colors rounded-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Message</label>
                    <textarea 
                      required 
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all resize-none"
                      placeholder="How can we assist you with our collections?"
                    ></textarea>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-xs">{errorMsg}</p>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-text-dark text-white text-sm uppercase tracking-wider font-medium hover:bg-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          <div className="mt-20">
            <div className="w-full h-96 bg-gray-200 rounded-sm relative overflow-hidden flex items-center justify-center">
              <span className="text-gray-500 font-medium z-10 absolute bg-white/80 px-4 py-2 rounded shadow backdrop-blur-sm">Google Map Placeholder</span>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126844.06231267868!2d3.284992983226487!3d6.548034870535359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b285ee4fe15%3A0xa3b549542c38867c!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1716301234567!5m2!1sen!2sus" 
                width="100%" height="100%" style={{ border: 0, filter: 'grayscale(0.5)' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0">
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
