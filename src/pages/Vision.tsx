import { motion } from 'framer-motion';
import shoeImg from '../assets/images/luxury_shoe_1783831961320.jpg';
import bagImg from '../assets/images/luxury_bag_1783831973371.jpg';
import clothImg from '../assets/images/luxury_clothing_1783831985491.jpg';
import aboutImg from '../assets/images/about_brand_1783832081002.jpg';

export default function Vision() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" className="w-full">
      <section className="py-20 bg-blue-50/30 border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-dark mb-4">Our Vision</h1>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeIn} className="order-2 lg:order-1">
              <h2 className="text-sm font-medium uppercase tracking-widest text-secondary mb-3">The Future of Fashion</h2>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-text-dark mb-6 leading-tight">
                Building a Globally Recognized Nigerian Luxury Brand
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-serif font-semibold text-text-dark mb-2">Empowering Women's Fashion</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Our ultimate goal is to create a space where fashion is not just worn, but experienced. We aim to empower women by providing them with sartorial choices that enhance their natural grace and command respect in any setting.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xl font-serif font-semibold text-text-dark mb-2">Luxury Innovation</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We are constantly exploring new horizons in luxury retail. From incorporating sustainable yet premium materials to redefining the online shopping experience, ADA'S HENRY is committed to staying at the forefront of fashion innovation.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-serif font-semibold text-text-dark mb-2">Long-term Commitment</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We are not building for today; we are building a legacy. Our commitment is to establish ADA'S HENRY as a household name synonymous with quality, elegance, and Nigerian excellence on the global stage.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] relative rounded-sm overflow-hidden shadow-lg group cursor-pointer">
                    <img src={shoeImg} alt="Vision" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="aspect-square relative rounded-sm overflow-hidden shadow-lg group cursor-pointer">
                    <img src={bagImg} alt="Vision" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square relative rounded-sm overflow-hidden shadow-lg group cursor-pointer">
                    <img src={clothImg} alt="Vision" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="aspect-[3/4] relative rounded-sm overflow-hidden shadow-lg group cursor-pointer">
                    <img src={aboutImg} alt="Vision" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
