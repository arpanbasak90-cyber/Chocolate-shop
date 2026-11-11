import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              onComplete();
            }, 600);
          }, 400);
          return 100;
        }
        return prev + 2.5;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-chocolate-950 text-cream-100 overflow-hidden transition-opacity duration-700 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background chocolate swirls & bokeh effects */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-caramel-600/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gold-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-chocolate-800/40 blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        {/* Animated Chocolate Logo Mark */}
        <div className="relative mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-caramel-500 via-chocolate-800 to-chocolate-950 p-[2px] shadow-2xl gold-glow animate-float">
            <div className="w-full h-full rounded-[22px] bg-chocolate-900 flex items-center justify-center border border-gold-400/30">
              <span className="text-4xl md:text-5xl select-none">🍫</span>
            </div>
          </div>
          {/* Sparkle decorative icons */}
          <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Brand Name */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chocolate-900/80 border border-gold-500/30 text-gold-400 text-xs tracking-widest uppercase font-semibold mb-4">
          Handcrafted In Small Batches
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
          ZORA <span className="text-gold-400 italic">SHOP</span>
        </h1>

        {/* Tagline */}
        <p className="text-caramel-300 font-serif italic text-lg md:text-xl mb-8 tracking-wide">
          "Sweetness in Every Bite!"
        </p>

        {/* Loading Bar */}
        <div className="w-64 md:w-80 h-1.5 bg-chocolate-900 rounded-full overflow-hidden border border-chocolate-800 mb-4">
          <div
            className="h-full bg-gradient-to-r from-caramel-500 via-gold-400 to-caramel-400 transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between w-64 md:w-80 text-xs text-chocolate-300 font-mono mb-8">
          <span>Tempering artisan cocoa...</span>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* Quick Skip button */}
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400/80 hover:text-gold-300 transition-all group py-1.5 px-4 rounded-full border border-gold-500/20 hover:border-gold-500/50 bg-chocolate-900/40"
        >
          <span>Enter Shop Directly</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Subtle bottom note */}
      <div className="absolute bottom-6 text-[11px] text-chocolate-400 tracking-wider uppercase">
        100% Homemade • Pure Vegetarian • No Preservatives
      </div>
    </div>
  );
};

