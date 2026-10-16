import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Star, ShieldCheck, Heart, Truck, Clock, 
  ShoppingBag, Eye, MessageCircle, Check, 
  Filter, X, ChevronRight, RefreshCw, AlertCircle, Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import shoeImg from '../assets/images/luxury_shoe_1783831961320.jpg';
import bagImg from '../assets/images/luxury_bag_1783831973371.jpg';
import clothImg from '../assets/images/luxury_clothing_1783831985491.jpg';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  availability?: boolean;
  featured?: boolean;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'dfff4421-1b89-44bf-8bd0-e86f9f83fd62',
    name: 'Aura Crystal Stilettos',
    category: 'Shoes',
    price: 1250,
    description: 'Elegant stilettos encrusted with fine crystals. Perfect for a luxurious evening.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'bae59a03-5c93-4461-8111-8999effa55d3',
    name: 'Monogram Italian Leather Tote',
    category: 'Bags',
    price: 2400,
    description: 'Premium handcrafted Italian leather tote with signature monogram pattern.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'b865eee5-8788-4461-b777-f73e986a1344',
    name: 'Silk Chiffon Evening Gown',
    category: 'Clothes',
    price: 3100,
    description: 'Flowing silk chiffon gown with delicate embroidery and a timeless silhouette.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: '1aca5a18-8335-4ec0-b46f-0e950edb1f10',
    name: 'Bespoke Royal Tuxedo Suit',
    category: 'Clothes',
    price: 2800,
    description: 'Tailored luxury bespoke suit crafted from premium wool and satin lapels.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('adas_henry_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PRODUCTS;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();

  const WHATSAPP_NUMBER = '2349067566746';

  const fetchProducts = async (showLoadingState = false) => {
    if (showLoadingState && products.length === 0) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    // 1. Try backend API
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          try { localStorage.setItem('adas_henry_cached_products', JSON.stringify(data)); } catch {}
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('API products fetch notice:', err);
    }

    // 2. Direct Supabase query (crucial for Vercel static deployments)
    try {
      const { data, error: supaErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!supaErr && Array.isArray(data) && data.length > 0) {
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price) || 0,
          description: p.description,
          availability: p.availability !== false,
          featured: p.featured === true,
          images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        setProducts(mapped);
        try { localStorage.setItem('adas_henry_cached_products', JSON.stringify(mapped)); } catch {}
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
    } catch (supaErr) {
      console.warn('Supabase query notice:', supaErr);
    }

    // 3. Keep existing products or fallback to DEFAULT_PRODUCTS
    setProducts(prev => (prev && prev.length > 0 ? prev : DEFAULT_PRODUCTS));
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();

    // Listen for product additions/updates from Admin dashboard in same session
    const handleProductsUpdated = () => {
      fetchProducts(false);
    };
    window.addEventListener('products-updated', handleProductsUpdated);

    // Also refresh when tab gains focus
    const handleFocus = () => {
      fetchProducts(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('products-updated', handleProductsUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle URL hash navigation (e.g. /#collection)
  useEffect(() => {
    if (location.hash === '#collection') {
      setTimeout(() => {
        const el = document.getElementById('collection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const scrollToCollection = (categoryName?: string) => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    }
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract unique categories from actual products, ensuring standard ones exist
  const categories = ['All', ...Array.from(new Set([
    'Shoes',
    'Bags',
    'Clothes',
    ...products.map(p => p.category).filter(Boolean)
  ]))];

  // Filter products based on category and search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || 
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = searchQuery.trim() === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category && p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  const getProductImage = (product: Product, index = 0) => {
    if (product.images && product.images.length > index && product.images[index]) {
      return product.images[index];
    }
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('bag')) return bagImg;
    if (cat.includes('cloth')) return clothImg;
    return shoeImg;
  };

  const openProductQuickView = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const buildWhatsAppOrderLink = (product: Product) => {
    const message = `Hello ADA'S HENRY, I am interested in ordering:\n\n*${product.name}*\n• Category: ${product.category}\n• Price: $${Number(product.price).toFixed(2)}\n• Ref ID: ${product.id}\n\nPlease confirm availability and payment/delivery details.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-pink-50/50 to-blue-50/30 overflow-hidden pt-20">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn} className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-1.5 bg-white/80 border border-primary/20 rounded-full text-xs font-semibold uppercase tracking-wider text-primary mb-6 shadow-sm">
                <span>Haute Couture & Luxury Essentials</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-text-dark leading-tight mb-6">
                Elevating Women's <br/> <span className="text-primary italic">Luxury Fashion</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
                Discover premium shoes, handcrafted handbags, and bespoke clothing designed for timeless elegance and effortless confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => scrollToCollection()}
                  className="px-8 py-4 bg-text-dark text-white text-sm uppercase tracking-wider font-medium hover:bg-primary hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl rounded-sm cursor-pointer flex items-center gap-2 group"
                >
                  <span>Shop Collection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/contact" className="px-8 py-4 bg-transparent border border-text-dark text-text-dark text-sm uppercase tracking-wider font-medium hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 rounded-sm">
                  Contact Us
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative block mt-8 lg:mt-0 group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-t-[100px] rounded-bl-[100px] transform translate-x-4 lg:translate-x-6 translate-y-4 lg:translate-y-6 transition-transform duration-700 group-hover:translate-x-8 group-hover:translate-y-8"></div>
              <img 
                src="/sav.jpg" 
                alt="Haute Couture" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('ibb.co')) {
                    target.src = 'https://i.ibb.co/nqkbDfpk/sav.jpg';
                  } else {
                    target.src = clothImg;
                  }
                }}
                className="relative w-full max-h-[500px] lg:max-h-none lg:h-[650px] object-cover object-top rounded-t-[100px] rounded-bl-[100px] shadow-2xl transition-transform duration-700 hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Collections by Category */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-dark mb-4">Featured Categories</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-500 max-w-xl mx-auto">
              Explore our meticulously curated selection of premium pieces designed for the modern, elegant woman.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Luxury Shoes', category: 'Shoes', img: shoeImg, desc: 'Heels, stilettos, and bespoke footwear crafted for comfort and prestige.' }, 
              { title: 'Luxury Bags', category: 'Bags', img: bagImg, desc: 'Handcrafted Italian leather totes, clutches, and signature statement bags.' }, 
              { title: 'Luxury Clothing', category: 'Clothes', img: clothImg, desc: 'Flowing silk gowns, tailored suits, and contemporary couture.' }
            ].map((item) => (
              <motion.div 
                key={item.title} 
                variants={fadeIn} 
                onClick={() => scrollToCollection(item.category)}
                className="group cursor-pointer bg-neutral-50/50 p-4 rounded-sm border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden mb-6 aspect-[4/5] rounded-sm bg-gray-50">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-5 py-2.5 bg-white/95 text-text-dark text-xs uppercase tracking-widest font-semibold shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      View {item.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-serif font-semibold text-text-dark group-hover:text-primary transition-colors">{item.title}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {getCategoryCount(item.category)} Items
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{item.desc}</p>
                <div className="inline-flex items-center text-sm font-medium uppercase tracking-wide text-text-dark group-hover:text-primary transition-colors">
                  <span>Explore Catalog</span> <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DYNAMIC LIVE PRODUCT CATALOG SECTION */}
      <section id="collection" className="py-24 bg-gray-50/70 border-t border-gray-100 scroll-mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div variants={fadeIn} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <ShoppingBag size={14} />
              <span>Direct From Studio & Admin Catalog</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-dark mb-4">
              Our Luxury Catalog
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-base">
              Explore all live products updated directly by our studio. Every piece is verified for authenticity, craftsmanship, and instant delivery.
            </p>
          </motion.div>

          {/* Controls: Category Filter Tabs & Search Bar */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start w-full md:w-auto">
              {categories.map((cat) => {
                const count = getCategoryCount(cat);
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-text-dark text-white shadow-md scale-105'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-text-dark hover:text-text-dark'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Refresh Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-text-dark focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => fetchProducts(false)}
                title="Refresh product catalog"
                disabled={isRefreshing}
                className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-primary hover:border-primary transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-primary' : ''} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-sm border border-gray-100 p-4 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-sm mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Banner */}
          {!loading && error && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-sm text-center max-w-xl mx-auto my-8">
              <AlertCircle size={28} className="mx-auto text-rose-500 mb-2" />
              <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
              <button
                onClick={() => fetchProducts()}
                className="px-4 py-2 bg-rose-600 text-white rounded text-xs uppercase tracking-wider font-semibold hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product) => {
                const imgUrl = getProductImage(product);
                const isAvailable = product.availability !== false;

                return (
                  <motion.div
                    key={product.id}
                    variants={fadeIn}
                    className="bg-white border border-gray-100 hover:border-primary/40 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    {/* Image Area with badges & quick actions */}
                    <div 
                      onClick={() => openProductQuickView(product)}
                      className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const cat = (product.category || '').toLowerCase();
                          if (cat.includes('bag')) target.src = bagImg;
                          else if (cat.includes('cloth')) target.src = clothImg;
                          else target.src = shoeImg;
                        }}
                      />

                      {/* Stock / Availability Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 bg-emerald-500/90 text-white text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm backdrop-blur-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            In Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-800/85 text-white text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm backdrop-blur-sm">
                            Pre-Order
                          </span>
                        )}

                        {product.featured && (
                          <span className="px-2.5 py-1 bg-primary text-white text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <span className="px-4 py-2.5 bg-white text-text-dark text-xs uppercase font-bold tracking-wider rounded-sm shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Eye size={14} />
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center text-xs mb-1.5">
                          <span className="text-primary font-semibold uppercase tracking-wider">
                            {product.category || 'Luxury'}
                          </span>
                        </div>

                        <h3 
                          onClick={() => openProductQuickView(product)}
                          className="font-serif font-bold text-lg text-text-dark hover:text-primary transition-colors cursor-pointer line-clamp-1 mb-2"
                        >
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price & Action Row */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block font-sans">Price</span>
                          <span className="text-lg font-serif font-bold text-text-dark">
                            ${typeof product.price === 'number' 
                              ? product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : product.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProductQuickView(product)}
                            className="p-2 border border-gray-200 text-gray-600 hover:text-primary hover:border-primary rounded-sm transition-colors"
                            title="View product details"
                          >
                            <Eye size={16} />
                          </button>
                          <a
                            href={buildWhatsAppOrderLink(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white hover:bg-[#20b859] rounded-sm text-xs font-semibold tracking-wide transition-all shadow-sm"
                            title="Inquire or order on WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>Order</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-sm border border-gray-100 max-w-lg mx-auto p-8">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-serif font-bold text-text-dark mb-2">
                No items found in this collection
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchQuery 
                  ? `No products matching "${searchQuery}". Try a different keyword.`
                  : `There are currently no products under "${selectedCategory}".`}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-5 py-2.5 bg-text-dark text-white rounded-sm text-xs uppercase tracking-wider font-semibold hover:bg-primary transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            </div>
          )}

          {/* Footnote for Catalog */}
          <div className="mt-16 text-center text-xs text-gray-400 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> 100% Authentic Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-primary" /> Worldwide Luxury Dispatch
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-primary" /> Concierge Support
            </span>
          </div>
        </div>
      </section>

      {/* PRODUCT QUICK VIEW & ORDER MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-sm shadow-2xl overflow-hidden my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-text-dark rounded-full shadow-md backdrop-blur-sm transition-all"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Images Section */}
                <div className="bg-gray-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white shadow-inner mb-4">
                    <img
                      src={getProductImage(selectedProduct, activeImageIndex)}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const cat = (selectedProduct.category || '').toLowerCase();
                        if (cat.includes('bag')) target.src = bagImg;
                        else if (cat.includes('cloth')) target.src = clothImg;
                        else target.src = shoeImg;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      {selectedProduct.availability !== false ? (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-800 text-white text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm">
                          Pre-Order
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multiple image thumbnails if present */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                            activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt="" 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const cat = (selectedProduct.category || '').toLowerCase();
                              if (cat.includes('bag')) target.src = bagImg;
                              else if (cat.includes('cloth')) target.src = clothImg;
                              else target.src = shoeImg;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-widest font-bold text-primary">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.featured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-semibold">
                          Featured Piece
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-dark mb-4">
                      {selectedProduct.name}
                    </h2>

                    <div className="text-3xl font-serif font-bold text-primary mb-6">
                      ${typeof selectedProduct.price === 'number' 
                        ? selectedProduct.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                        : selectedProduct.price}
                    </div>

                    <div className="space-y-3 mb-8">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedProduct.description || 'Crafted with premium materials and bespoke attention to detail, adhering to the highest standards of luxury fashion.'}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-b border-gray-100 py-4 mb-6 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Availability</span>
                        <span className="font-semibold text-text-dark">
                          {selectedProduct.availability !== false ? 'Ready to Ship' : 'Pre-order / Bespoke inquiry'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reference ID</span>
                        <span className="font-mono text-[11px] text-gray-500">{selectedProduct.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Packaging</span>
                        <span className="font-semibold text-text-dark">Signature ADA'S HENRY Box</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <a
                      href={buildWhatsAppOrderLink(selectedProduct)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-[#25D366] hover:bg-[#20b859] text-white font-semibold text-sm uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle size={18} />
                      <span>Order On WhatsApp</span>
                    </a>

                    <Link
                      to={`/contact?subject=${encodeURIComponent(`Inquiry for ${selectedProduct.name}`)}`}
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-text-dark font-medium text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Inquire via Email / Concierge</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-dark mb-4">Why Choose ADA'S HENRY</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We offer a luxury shopping experience that goes beyond the product. From our meticulous craftsmanship to our dedicated customer service, excellence is our standard.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop", title: "Luxury Quality", desc: "Finest materials and impeccable craftsmanship in every piece." },
              { img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop", title: "Trusted Brand", desc: "A legacy of trust, authenticity, and premium service." },
              { img: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=800&auto=format&fit=crop", title: "Unique Designs", desc: "Exclusive collections designed to make you stand out." },
              { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", title: "Fast Customer Support", desc: "Dedicated assistance tailored to your premium needs." },
              { img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop", title: "Latest Fashion Trends", desc: "Curated selections reflecting global luxury standards." },
              { img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop", title: "Affordable Premium", desc: "Accessible luxury without compromising on quality." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white group overflow-hidden border border-gray-100 rounded-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col">
                <div className="relative h-56 overflow-hidden">
                   <img 
                     src={feature.img} 
                     alt={feature.title} 
                     referrerPolicy="no-referrer" 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop';
                     }}
                   />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-semibold text-text-dark mb-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-text-dark text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">Ready to Elevate Your Style?</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Experience the pinnacle of luxury fashion. Connect with our styling experts to find the perfect piece for your collection.
            </p>
            <Link to="/contact" className="inline-block px-10 py-4 bg-accent text-text-dark text-sm uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300 shadow-xl rounded-sm">
              Contact Us Today
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </section>
    </motion.div>
  );
}
