import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Sparkles,
  ShoppingBag,
  Printer,
  Heart,
  Eye,
  Gift,
  Smile,
  Leaf,
  Phone,
  Maximize2,
  X,
  Plus
} from 'lucide-react';

export const DigitalMenuCard = () => {
  const { products, addToCart, addToast } = useShop();
  const [favoriteIds, setFavoriteIds] = useState(['prod-almond', 'prod-rasmalai']);
  const [showOriginalPoster, setShowOriginalPoster] = useState(false);

  const toggleFavorite = (id, name) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        addToast(`Removed ${name} from favorites`, 'info');
        return prev.filter((i) => i !== id);
      } else {
        addToast(`Saved ${name} to your favorites! ♡`);
        return [...prev, id];
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // The 9 classic chocolates from the uploaded reference
  const menuChocolates = products.slice(0, 9);

  return (
    <section id="menu-card" className="py-16 relative overflow-hidden bg-gradient-to-b from-chocolate-950 via-[#23120b] to-chocolate-950 text-cream-100">
      
      {/* Background ambient chocolate lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-caramel-600/15 via-gold-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header & Reference Poster Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-chocolate-900 border border-gold-500/40 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Exact Visual Menu Reference</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Authentic Handmade Chocolate Menu
            </h2>
            <p className="text-xs sm:text-sm text-caramel-200 mt-1">
              Crafted matching our official menu poster with both Per Piece and 250g Box packaging.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Original Poster Modal Trigger */}
            <button
              onClick={() => setShowOriginalPoster(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white text-xs font-bold shadow-lg transition"
            >
              <Eye className="w-4 h-4" />
              <span>View Reference Poster</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-chocolate-900 hover:bg-chocolate-800 border border-chocolate-700 text-gold-300 text-xs font-semibold transition"
              title="Print Menu Card"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            THE CHOCO FUSION / ZORA SHOP POSTER BOARD (EXACT DESIGN RECREATION)
        ══════════════════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden border-4 border-[#522c1b] bg-gradient-to-b from-[#1b0a06] via-[#2c130b] to-[#1a0805] shadow-2xl gold-glow">
          
          {/* DRIPPING CHOCOLATE TOP BORDER SVG */}
          <div className="w-full overflow-hidden leading-none relative z-20">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-16 sm:h-24 fill-[#3c170b] drop-shadow-lg"
            >
              <path d="M0,0 L1200,0 L1200,40 Q1150,90 1100,50 Q1050,10 1000,55 Q950,110 900,45 Q850,20 800,75 Q750,120 700,60 Q650,20 600,85 Q550,115 500,45 Q450,15 400,65 Q350,110 300,50 Q250,10 200,70 Q150,115 100,40 Q50,10 0,60 Z"></path>
              <circle cx="200" cy="85" r="5" fill="#3c170b" />
              <circle cx="600" cy="100" r="6" fill="#3c170b" />
              <circle cx="750" cy="115" r="7" fill="#3c170b" />
              <circle cx="950" cy="105" r="5" fill="#3c170b" />
            </svg>
          </div>

          <div className="p-6 sm:p-10 pt-2 relative z-10 space-y-8">
            
            {/* POSTER HEADER */}
            <div className="text-center relative">
              
              {/* Floating badges like in original image */}
              <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto absolute inset-x-0 top-0 pointer-events-none">
                <div className="w-28 text-center p-2 rounded-2xl bg-[#35180f]/80 border border-gold-500/30 text-gold-300 text-[10px] font-serif italic shadow-md rotate-[-4deg]">
                  Pure Indulgence in Every Bite ♡
                </div>
                <div className="w-28 text-center p-2 rounded-2xl bg-[#35180f]/80 border border-gold-500/30 text-gold-300 text-[10px] font-serif italic shadow-md rotate-[4deg]">
                  Small Bites... Big Happiness ♡
                </div>
              </div>

              {/* Main 3D Glossy Brand Title */}
              <div className="inline-block relative">
                <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-caramel-300 to-gold-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  Choco Fusion
                </h1>
                <span className="block text-xs uppercase tracking-[0.3em] font-semibold text-caramel-300 mt-1">
                  HOMEMADE CHOCOLATES — Crafting Sweet Memories ♡
                </span>
              </div>

              {/* Menu Card Cursive Banner */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-gold-400"></span>
                <span className="font-serif text-2xl sm:text-3xl font-bold italic text-gold-300 tracking-wide drop-shadow-md">
                  ♡ Menu Card ♡
                </span>
                <span className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-gold-400"></span>
              </div>
            </div>

            {/* 3x3 CHOCOLATE CARDS GRID (EXACT RECREATION OF REFERENCE IMAGE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {menuChocolates.map((item, index) => {
                const isFavorite = favoriteIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="relative bg-gradient-to-b from-[#fdfbf7] to-[#f4eedb] rounded-2xl p-4 sm:p-5 text-chocolate-950 shadow-xl border-2 border-caramel-300/80 hover:border-gold-400 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group"
                  >
                    
                    {/* Top Header inside Card: Heart + Brown Ribbon Pill Title */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      {/* Heart Icon */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id, item.name)}
                        className="p-1 text-caramel-700 hover:text-red-500 transition hover:scale-125"
                        title="Add to wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-600'
                          }`}
                        />
                      </button>

                      {/* Dark Brown Ribbon Pill with Title */}
                      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#2f140c] via-[#431f13] to-[#2f140c] text-white text-xs sm:text-sm font-serif font-bold italic tracking-wide shadow-md border border-gold-500/30 text-center flex-1 mx-2">
                        {item.name}
                      </div>

                      {/* Number Index */}
                      <span className="text-[10px] font-mono font-bold text-stone-400 w-4 text-right">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Chocolate Image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-chocolate-100 shadow-inner my-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/40 via-transparent to-transparent"></div>
                      
                      {/* Dietary dot */}
                      <span className="absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-xs">
                        Pure Veg 🟢
                      </span>
                    </div>

                    {/* Pricing Section (Matching image: ₹X / Piece, ₹Y / 250 gm) */}
                    <div className="mt-3 pt-2 border-t border-caramel-200/80">
                      <div className="flex items-center justify-around text-center py-1 bg-white/70 rounded-xl border border-cream-300/80 mb-3">
                        <div>
                          <div className="font-serif text-base sm:text-lg font-bold text-chocolate-950">
                            ₹{item.piecePrice}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            / Piece
                          </div>
                        </div>

                        <div className="h-6 w-[1px] bg-cream-300"></div>

                        <div>
                          <div className="font-serif text-base sm:text-lg font-bold text-caramel-700">
                            ₹{item.boxPrice}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            / 250 gm
                          </div>
                        </div>
                      </div>

                      {/* Quick Ordering Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(item, 'piece', 5)}
                          className="py-1.5 px-2 rounded-lg bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs"
                          title="Add 5 pieces to box"
                        >
                          <Plus className="w-3 h-3 text-gold-400" />
                          <span>5 Pieces</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addToCart(item, 'pack250g', 1)}
                          className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs"
                          title="Add 250g Box to cart"
                        >
                          <ShoppingBag className="w-3 h-3 text-gold-300" />
                          <span>250g Box</span>
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* 4 GOLDEN OUTLINE ICONS BELOW GRID (MATCHING THE UPLOADED POSTER) */}
            <div className="pt-6 border-t border-[#441f12] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-chocolate-900/60 border border-gold-500/20">
                <Leaf className="w-6 h-6 text-gold-400" />
                <span className="font-serif text-xs font-bold text-cream-100">Premium Ingredients</span>
                <span className="text-[10px] text-stone-400">Pure cocoa solids & roasted nuts</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-chocolate-900/60 border border-gold-500/20">
                <Heart className="w-6 h-6 text-gold-400" />
                <span className="font-serif text-xs font-bold text-cream-100">Homemade with Love</span>
                <span className="text-[10px] text-stone-400">Handcrafted in small batches</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-chocolate-900/60 border border-gold-500/20">
                <Gift className="w-6 h-6 text-gold-400" />
                <span className="font-serif text-xs font-bold text-cream-100">Perfect for Gifting</span>
                <span className="text-[10px] text-stone-400">Luxury tins & custom tags</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-chocolate-900/60 border border-gold-500/20">
                <Smile className="w-6 h-6 text-gold-400" />
                <span className="font-serif text-xs font-bold text-cream-100">Freshly Prepared</span>
                <span className="text-[10px] text-stone-400">Melted upon order booking</span>
              </div>
            </div>

            {/* GOLDEN SATIN RIBBON FOOTER (MATCHING THE UPLOADED POSTER) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-gold-500 to-amber-600 text-chocolate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl font-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chocolate-950 text-gold-400 flex items-center justify-center shrink-0 shadow-md">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-chocolate-900">
                    For Orders & Enquiries:
                  </div>
                  <div className="font-serif text-base sm:text-lg font-bold text-chocolate-950 flex items-center gap-2">
                    <span>Drashti Bhatt — 9898014090</span>
                    <span className="text-xs text-chocolate-900 font-sans">/ {shopSettings.whatsappNumber}</span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right text-xs space-y-0.5">
                <div className="font-serif italic font-bold text-chocolate-950 text-sm">
                  Sweeten your moments with Choco Fusion & Zora Shop ♡
                </div>
                <div className="text-[11px] text-chocolate-900 font-semibold tracking-wide">
                  ✨ Sweetness in Every Bite! ✨
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* LIGHTBOX MODAL: ORIGINAL MENU REFERENCE POSTER */}
      {showOriginalPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-xl w-full max-h-[92vh] overflow-y-auto bg-chocolate-950 rounded-3xl p-4 border border-gold-500/40 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowOriginalPoster(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-3">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">
                Client Menu Reference Asset
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                Official Choco Fusion Menu Card
              </h3>
            </div>

            {/* Uploaded Menu Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-chocolate-800">
              <img
                src="/menu-reference.jpg"
                alt="Choco Fusion Reference Menu Card"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-stone-400">
                All 9 chocolate varieties, per-piece prices, and 250g box prices have been incorporated into this prototype.
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
