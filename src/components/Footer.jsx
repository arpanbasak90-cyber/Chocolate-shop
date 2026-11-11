import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Sparkles, MapPin, Phone, Mail, Heart, ShieldCheck } from 'lucide-react';

export const Footer = ({ onReplaySplash }) => {
  const { shopSettings } = useShop();

  return (
    <footer className="bg-chocolate-950 text-cream-200 border-t border-chocolate-800">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-caramel-500 to-chocolate-800 p-[1px] flex items-center justify-center">
                <span className="text-xl">🍫</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                ZORA <span className="text-gold-400 italic">SHOP</span>
              </span>
            </div>
            <p className="text-caramel-300 font-serif italic text-sm">
              "{shopSettings.tagline}"
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Handcrafting moments of unadulterated joy with artisanal cocoa, pure roasted nuts, and royal fusion flavours. Freshly prepared in small home batches with zero chemical preservatives.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-stone-400 font-medium">Follow us:</span>
              <div className="flex items-center gap-2 text-stone-300">
                <a href="#instagram" className="w-8 h-8 rounded-full bg-chocolate-900 hover:bg-caramel-600 flex items-center justify-center text-xs transition">📷</a>
                <a href="#facebook" className="w-8 h-8 rounded-full bg-chocolate-900 hover:bg-caramel-600 flex items-center justify-center text-xs transition">📘</a>
                <a href="#whatsapp" className="w-8 h-8 rounded-full bg-chocolate-900 hover:bg-caramel-600 flex items-center justify-center text-xs transition">💬</a>
              </div>
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Quick Exploration
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-gold-300 transition">
                  Homepage
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold-300 transition">
                  All Chocolates Catalog
                </Link>
              </li>
              <li>
                <a href="/#menu-card" className="hover:text-gold-300 transition">
                  Digital Menu Card & Prices
                </a>
              </li>
              <li>
                <Link to="/track" className="hover:text-gold-300 transition">
                  Live Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-gold-300 text-gold-400 font-semibold transition">
                  Customer Account & Saved Address
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold-300 text-caramel-400 font-semibold flex items-center gap-1 transition">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Dashboard (Demo Login)
                </Link>
              </li>
              <li>
                <button
                  onClick={onReplaySplash}
                  className="hover:text-gold-300 text-stone-400 flex items-center gap-1 text-[11px] transition"
                >
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  Re-watch Brand Intro Splash
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Signature Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="hover:text-cream-100 transition">🌰 Nutty Delights (Almond & Walnut Bites)</li>
              <li className="hover:text-cream-100 transition">👑 Royal Indian Fusion (Rasmalai & Gulkand)</li>
              <li className="hover:text-cream-100 transition">🍫 Classic Dark & Milk Silks</li>
              <li className="hover:text-cream-100 transition">🍪 Crunchy Oreo & Fruity Gems</li>
              <li className="hover:text-cream-100 transition">🎁 Custom Gift Hampers & Wedding Tins</li>
            </ul>
          </div>

          {/* Contact & Boutique Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Boutique Kitchen
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{shopSettings.shopAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{shopSettings.whatsappNumber} (Direct Orders)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{shopSettings.contactEmail}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-chocolate-900 border border-chocolate-800 text-[11px] text-stone-300">
              💡 <strong>Bulk & Corporate Inquiries:</strong> Reach us on WhatsApp for custom branding and event boxes.
            </div>
          </div>

        </div>
      </div>

      {/* Demo Disclaimer & Copyright Bar */}
      <div className="bg-chocolate-900/80 border-t border-chocolate-800 py-6 px-4 text-center text-xs text-stone-400 space-y-2">
        <p className="max-w-2xl mx-auto text-[11px] text-caramel-300/80">
          ⚠️ <strong>Interactive Prototype Note:</strong> This is a visual & functional demo prototype developed for <strong>ZORA SHOP</strong> to review the design, ordering flow, and admin panel before production deployment. No real payments or real SMS will be triggered.
        </p>
        <p className="flex items-center justify-center gap-1 text-[11px]">
          © {new Date().getFullYear()} ZORA SHOP. Handcrafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for chocolate lovers everywhere.
        </p>
      </div>
    </footer>
  );
};

