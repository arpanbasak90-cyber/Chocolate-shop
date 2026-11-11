import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Store, ArrowRight, Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const FirstScreen = () => {
  const { customerLogin, shopkeeperLogin, addToast } = useShop();

  // Mode: null (showing the two cards), 'customer-form', 'shopkeeper-form'
  const [activeForm, setActiveForm] = useState(null);

  // Customer Form State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Shopkeeper Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shopkeeperError, setShopkeeperError] = useState('');

  // Auto fill handlers for demonstration ease
  const handleAutoFillCustomer = () => {
    setCustName('Priya Sharma');
    setCustEmail('priya.sharma@gmail.com');
    setCustPhone('9823456789');
  };

  const handleAutoFillShopkeeper = () => {
    setAdminEmail('admin@zorashop.demo');
    setAdminPassword('demo123');
    setShopkeeperError('');
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim() || !custPhone.trim()) {
      addToast('Please fill all required customer fields', 'warning');
      return;
    }
    customerLogin({
      name: custName,
      email: custEmail,
      phone: custPhone
    });
  };

  const handleShopkeeperSubmit = (e) => {
    e.preventDefault();
    const success = shopkeeperLogin(adminEmail, adminPassword);
    if (!success) {
      setShopkeeperError('Invalid demo credentials. Use admin@zorashop.demo / demo123');
    } else {
      setShopkeeperError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#1c0c07] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-caramel-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 space-y-8 animate-fadeIn">
        
        {/* TOP BRAND HEADER (Matching image layout) */}
        <div className="rounded-3xl bg-[#3c1b11] border-2 border-[#5a2c1b] p-6 sm:p-8 text-center text-cream-100 shadow-2xl relative overflow-hidden">
          {/* Subtle chocolate highlight */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl"></div>

          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl select-none">🍫</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-wider text-white">
              ZORA SHOP
            </h1>
          </div>
          <p className="font-serif italic text-caramel-300 text-sm sm:text-base tracking-wide">
            "Sweetness in Every Bite!"
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-[#271008] border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide">
            Welcome! Choose your experience
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 1: TWO LARGE SIDE-BY-SIDE CARDS (CUSTOMER vs SHOPKEEPER)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeForm === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animate-fadeIn">
            
            {/* CARD 1: CUSTOMER */}
            <div className="bg-[#f2ebd9] rounded-3xl p-8 sm:p-10 border-2 border-[#e6d8be] shadow-xl hover:shadow-2xl hover:border-caramel-400 transition-all duration-300 flex flex-col items-center text-center justify-between group">
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-[#3c1b11] text-gold-400 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gold-500/30">
                  <ShoppingBag className="w-10 h-10 text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3c1b11] tracking-wide">
                    CUSTOMER
                  </h2>
                  <p className="text-stone-700 text-xs sm:text-sm mt-1 max-w-xs font-medium">
                    Shop delicious chocolates, choose piece or 250g packaging, and enjoy fresh homemade delivery.
                  </p>
                </div>
              </div>

              <div className="w-full pt-8">
                <button
                  type="button"
                  onClick={() => setActiveForm('customer-form')}
                  className="w-full py-4 px-6 rounded-2xl bg-[#3c1b11] hover:bg-[#250f08] text-gold-300 hover:text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  <span>Continue as Customer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2: SHOPKEEPER */}
            <div className="bg-[#f2ebd9] rounded-3xl p-8 sm:p-10 border-2 border-[#e6d8be] shadow-xl hover:shadow-2xl hover:border-caramel-400 transition-all duration-300 flex flex-col items-center text-center justify-between group">
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-[#3c1b11] text-gold-400 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gold-500/30">
                  <Store className="w-10 h-10 text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3c1b11] tracking-wide">
                    SHOPKEEPER
                  </h2>
                  <p className="text-stone-700 text-xs sm:text-sm mt-1 max-w-xs font-medium">
                    Manage customer orders, adjust chocolate prices, track store revenue and customer analytics.
                  </p>
                </div>
              </div>

              <div className="w-full pt-8">
                <button
                  type="button"
                  onClick={() => setActiveForm('shopkeeper-form')}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Shopkeeper Login</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 2: CUSTOMER SIMPLE LOGIN / REGISTRATION FORM
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeForm === 'customer-form' && (
          <div className="max-w-md mx-auto bg-[#f2ebd9] rounded-3xl p-6 sm:p-8 border-2 border-[#e6d8be] shadow-2xl animate-fadeIn space-y-6">
            
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#3c1b11] flex items-center justify-center text-2xl text-gold-400 shadow-md">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#3c1b11]">
                Customer Registration & Login
              </h2>
              <p className="text-xs text-stone-600">
                Enter your details to start exploring our fresh homemade chocolate collection.
              </p>
            </div>

            {/* Quick Demo Auto-fill Helper */}
            <div className="p-3 rounded-2xl bg-white/80 border border-caramel-300 flex items-center justify-between text-xs text-chocolate-900">
              <span className="text-stone-600 font-medium">Demo Profile:</span>
              <button
                type="button"
                onClick={handleAutoFillCustomer}
                className="font-bold underline text-caramel-700 hover:text-caramel-900"
              >
                1-Click Auto Fill (Priya Sharma)
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3c1b11] uppercase tracking-wider mb-1">
                  Full Name / Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3c1b11] uppercase tracking-wider mb-1">
                  Email Address (Gmail) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="priya.sharma@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3c1b11] uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="9823456789"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#3c1b11] hover:bg-[#250f08] text-gold-300 hover:text-white font-bold text-xs tracking-wider uppercase shadow-md transition"
                >
                  Continue to Chocolates →
                </button>

                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="w-full py-2.5 text-xs font-bold text-stone-600 hover:text-chocolate-950"
                >
                  ← Back to Options
                </button>
              </div>
            </form>

            <div className="text-[11px] text-center text-stone-500">
              🔒 No complicated registration • Instant demo access
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 3: SHOPKEEPER SECURE LOGIN FORM
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeForm === 'shopkeeper-form' && (
          <div className="max-w-md mx-auto bg-[#f2ebd9] rounded-3xl p-6 sm:p-8 border-2 border-[#e6d8be] shadow-2xl animate-fadeIn space-y-6">
            
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#3c1b11] flex items-center justify-center text-2xl text-gold-400 shadow-md">
                <Store className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#3c1b11]">
                Shopkeeper Admin Login
              </h2>
              <p className="text-xs text-stone-600">
                Authorized management console for ZORA SHOP.
              </p>
            </div>

            {/* Configurable Demo Credentials Box */}
            <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span>Default Demo Credentials:</span>
                <button
                  type="button"
                  onClick={handleAutoFillShopkeeper}
                  className="underline text-caramel-800 hover:text-caramel-950 font-bold"
                >
                  Auto Fill
                </button>
              </div>
              <div className="font-mono text-[11px] bg-white/90 p-2 rounded-xl space-y-0.5">
                <p>Email: <strong>admin@zorashop.demo</strong></p>
                <p>Password: <strong>demo123</strong></p>
              </div>
            </div>

            <form onSubmit={handleShopkeeperSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3c1b11] uppercase tracking-wider mb-1">
                  Shopkeeper Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@zorashop.demo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3c1b11] uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {shopkeeperError && (
                <p className="text-xs text-red-600 font-semibold text-center">
                  {shopkeeperError}
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs tracking-wider uppercase shadow-md transition"
                >
                  Enter Dashboard →
                </button>

                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="w-full py-2.5 text-xs font-bold text-stone-600 hover:text-chocolate-950"
                >
                  ← Back to Options
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center text-xs text-stone-400">
          ZORA SHOP Homemade Chocolates • Simple, Clean & Responsive Prototype
        </div>

      </div>

    </div>
  );
};

