import { motion } from 'framer-motion';
import aboutImg from '../assets/images/about_brand_1783832081002.jpg';

export default function About() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" className="w-full">
      {/* Page Header */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-dark mb-4">Our Story</h1>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div variants={fadeIn} className="group cursor-pointer">
              <div className="relative aspect-[4/5] max-w-md mx-auto md:mx-0">
                <div className="w-full h-full overflow-hidden rounded-sm shadow-xl relative z-10">
                  <img src={aboutImg} alt="ADA'S HENRY Atelier" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-pink-50 z-0 rounded-sm transition-transform duration-700 group-hover:-translate-x-4 group-hover:-translate-y-4"></div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Who We Are</h2>
              <h3 className="text-3xl font-serif font-bold text-text-dark mb-6">Redefining Elegance for the Modern Woman</h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  ADA'S HENRY is a premium luxury fashion brand born out of a passion for timeless elegance and impeccable craftsmanship. We curate and design exclusive collections of luxury shoes, exquisite handbags, and sophisticated clothing for women who appreciate the finer things in life.
                </p>
                <p>
                  Rooted in Nigeria but with a global vision, we understand that true luxury is not just about the label; it's about the feeling of confidence and grace that comes from wearing something truly exceptional.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div variants={fadeIn} className="bg-gray-50 p-10 rounded-sm">
              <h4 className="text-xl font-serif font-bold text-text-dark mb-4">Our Mission</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                To empower women globally by providing access to premium, high-quality fashion that enhances their confidence and celebrates their unique beauty through exceptional craftsmanship.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="bg-gray-50 p-10 rounded-sm">
              <h4 className="text-xl font-serif font-bold text-text-dark mb-4">Core Values</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Integrity, uncompromising quality, customer-centricity, and an unwavering commitment to excellence in every stitch, seam, and interaction.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-gray-50 p-10 rounded-sm">
              <h4 className="text-xl font-serif font-bold text-text-dark mb-4">Luxury Philosophy</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                We believe luxury is a personal experience. It is the subtle weight of fine fabric, the perfect silhouette, and the enduring quality that stands the test of time and trends.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="py-24 bg-text-dark text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-serif font-bold mb-6">Our Commitment to Quality</h2>
            <div className="w-16 h-1 bg-accent mx-auto mb-8"></div>
            <p className="text-gray-300 text-lg leading-relaxed mb-0">
              At ADA'S HENRY, customer satisfaction is our paramount priority. We source only the finest materials and partner with master artisans to ensure that every piece bearing our name represents the pinnacle of luxury fashion. Your trust is our most valued asset.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
