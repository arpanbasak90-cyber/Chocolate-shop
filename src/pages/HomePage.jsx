import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Award,
  CheckCircle,
  MessageCircle,
  Star,
  Send,
  Gift,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const HomePage = () => {
  const { products, shopSettings, addToast } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('All Chocolates');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Bestsellers (Top 4 products)
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);

  // Special Chocolates (Rasmalai, Gulkand, Celebration Hamper)
  const specialChocolates = products.filter(
    (p) => p.category === 'Indian Fusion' || p.category === 'Gift Hampers'
  );

  // Filtered Collection
  const collectionProducts = selectedCategory === 'All Chocolates'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      addToast('Please enter your name and phone number', 'warning');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      addToast(`Thank you ${contactName}! We received your inquiry and will reach out via WhatsApp/call. 🍫`);
      setContactName('');
      setContactPhone('');
      setContactMsg('');
    }, 700);
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 font-sans text-chocolate-950">

      {/* ══════════════════════════════════════════════════════════════════════════
          1. HERO SECTION (Section 4 Requirement)
          Heading: "Discover the Sweetest Side of Life!"
          Subtitle: "Handcrafted chocolates made to make every moment special."
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#240f08] via-[#35170d] to-[#1c0c07] text-cream-100 py-16 sm:py-24">
        {/* Glow & ambient cocoa highlights */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-caramel-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3c1b11] border border-gold-500/30 text-gold-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Handmade with Love & Pure Cocoa Butter</span>
              </div>

              {/* Exact required heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Discover the Sweetest Side of Life!
              </h1>

              {/* Exact required subtitle */}
              <p className="text-base sm:text-lg text-cream-200/90 max-w-xl leading-relaxed">
                Handcrafted chocolates made to make every moment special.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#collection"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#3c1b11] hover:bg-[#4a2114] border border-gold-500/30 text-gold-300 hover:text-white font-bold text-sm transition"
                >
                  <span>Explore All {products.length}+ Varieties</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 text-xs text-stone-300 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="font-serif font-bold text-lg text-gold-400">100%</div>
                  <div className="text-[11px] text-stone-400">Pure Vegetarian</div>
                </div>
                <div>
                  <div className="font-serif font-bold text-lg text-gold-400">0%</div>
                  <div className="text-[11px] text-stone-400">Chemical Preservatives</div>
                </div>
                <div>
                  <div className="font-serif font-bold text-lg text-gold-400">Fresh</div>
                  <div className="text-[11px] text-stone-400">Made on Booking</div>
                </div>
              </div>
            </div>

            {/* Right Column: Beautiful Chocolate Photography */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border-2 border-gold-500/40 shadow-2xl bg-[#2b130a] group">
                <img
                  src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=85"
                  alt="Zora Shop Artisan Chocolates"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/chocolate-placeholder.svg';
                  }}
                  className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c0c07] via-transparent to-transparent"></div>

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#2b130a]/90 backdrop-blur-md border border-gold-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                      Signature Creation
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white">
                      Almond Bite & Rasmalai
                    </h3>
                  </div>
                  <a
                    href="#collection"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 text-white font-bold text-xs"
                  >
                    Explore
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. BESTSELLING CHOCOLATES
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-100 text-caramel-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-caramel-600" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#3c1b11]">
              Bestselling Chocolates
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Hand-tempered chocolate classics and crunchy nut creations loved by our customers.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-caramel-700 hover:text-caramel-900 group"
          >
            <span>View All Chocolates</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. OUR CHOCOLATE COLLECTION (Responsive Grid with Filter Tabs)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2ebd9] text-chocolate-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>Complete Menu</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#3c1b11]">
            Our Chocolate Collection
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Choose individual pieces or 250g boxes for your daily sweet indulgence or gifting.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat
                  ? 'bg-[#3c1b11] text-gold-300 shadow-md scale-105'
                  : 'bg-white text-chocolate-800 border border-cream-300 hover:border-caramel-400 hover:bg-cream-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. SPECIAL CHOCOLATES (Festive Fusion & Hampers)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#2b130a] text-cream-100 p-8 sm:p-12 border border-gold-500/30 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3c1b11] border border-gold-500/30 text-gold-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 text-gold-400" />
              <span>Chef Specialties</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-white">
              Special Chocolates & Royal Fusion
            </h2>
            <p className="text-xs sm:text-sm text-caramel-200 mt-1">
              Indian festive delicacies like Rasmalai Kesar white chocolate and sun-cooked Damask rose petal Gulkand pralines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialChocolates.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. WHY CHOOSE ZORA SHOP?
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-100 text-caramel-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-caramel-600" />
            <span>The Homemade Difference</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#3c1b11]">
            Why Choose Zora Shop?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Genuine homemade purity you can taste in every single bite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-caramel-100 flex items-center justify-center text-3xl">
              🏠
            </div>
            <h3 className="font-serif font-bold text-base text-[#3c1b11]">100% Homemade</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Crafted in our clean boutique kitchen in small, hand-monitored batches.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl">
              🟢
            </div>
            <h3 className="font-serif font-bold text-base text-[#3c1b11]">Pure Vegetarian</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Completely free from animal gelatins, animal fats, and artificial additives.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-100 flex items-center justify-center text-3xl">
              🌰
            </div>
            <h3 className="font-serif font-bold text-base text-[#3c1b11]">Roasted Nuts</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Whole California almonds and Kashmiri walnuts slow-roasted to golden crunch.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-chocolate-100 flex items-center justify-center text-3xl">
              🎁
            </div>
            <h3 className="font-serif font-bold text-base text-[#3c1b11]">Custom Gifting</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Available in luxury 250g boxes and celebration tins with personalized tags.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          6. ABOUT US & CONTACT US
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* About Us (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-cream-300 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-100 text-caramel-800 text-xs font-bold uppercase tracking-wider">
              <span>About Us</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#3c1b11]">
              Crafting Sweet Memories
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              ZORA SHOP was born out of a deep passion for handcrafted chocolate art. We believe that true sweetness comes from pure cocoa butter, freshly roasted dry fruits, and honest homemade preparation.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Whether you need a box of Almond Bites for your evening tea, or 50 customized gift tins for a family wedding, we bake love into every piece.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#3c1b11]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Zero Palm Oil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Real Saffron & Nuts</span>
              </div>
            </div>
          </div>

          {/* Contact Us (7 Cols) */}
          <div id="contact" className="lg:col-span-7 bg-[#2b130a] text-cream-100 rounded-3xl p-8 border border-[#421d10] shadow-xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                Direct Kitchen Contact
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Contact Zora Shop
              </h2>
              <p className="text-xs text-stone-400">
                Have a bulk order question or special flavor request? Send us a message or chat on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1">Message / Requirements</label>
                <textarea
                  rows={2}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Tell us what chocolates you need..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500 resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSent}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs shadow-md transition"
                >
                  {isSent ? 'Submitting...' : 'Send Message'}
                </button>

                <a
                  href={`https://wa.me/${(shopSettings.whatsappNumber || '').replace(/\D/g, '')}?text=Hello%20Zora%20Shop,%20I%20would%20like%20to%20order%20chocolates.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat directly on WhatsApp ({shopSettings.whatsappNumber})</span>
                </a>
              </div>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};
