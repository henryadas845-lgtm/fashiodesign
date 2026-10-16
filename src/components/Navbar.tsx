import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/images/brand_logo_1783831948374.jpg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/#collection' },
    { name: 'About Us', path: '/about' },
    { name: 'Vision', path: '/vision' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-2xl font-serif font-bold tracking-widest text-text-dark group">
          <img src={logoImg} alt="ADA'S HENRY Logo" referrerPolicy="no-referrer" className="w-9 h-9 md:w-10 md:h-10 object-cover rounded-sm block shadow-sm" />
          <div>ADA'S <span className="text-primary group-hover:text-secondary transition-colors">HENRY</span></div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname === link.path ? 'text-primary' : 'text-gray-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin" className="text-gray-400 hover:text-secondary transition-colors" title="Admin Dashboard">
            <Settings size={20} />
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-text-dark p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-lg py-6 px-6 flex flex-col gap-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-medium uppercase tracking-wide py-2 border-b border-gray-100 ${
                  location.pathname === link.path ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/admin" className="text-gray-400 py-2 inline-flex items-center gap-2">
              <Settings size={20} /> <span className="text-sm">Admin</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
