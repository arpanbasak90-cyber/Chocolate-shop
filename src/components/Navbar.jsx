import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  LogOut,
  Sparkles,
  Home,
  Grid,
  Store
} from 'lucide-react';

export const Navbar = () => {
  const { cartCount, setIsCartOpen, currentCustomer, customerLogout, returnToRoleSelection } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Chocolates', path: '/shop' },
    { name: 'My Orders', path: '/orders' },
    { name: 'Customer Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Top Welcome Announcement */}
      <div className="bg-[#1b0a05] text-gold-300 text-xs py-1.5 px-4 text-center border-b border-[#3c1b11] flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
        <span>
          Welcome to <strong>ZORA SHOP</strong> • Handcrafted Homemade Chocolates • "Sweetness in Every Bite!"
        </span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#2b130a]/95 backdrop-blur-md border-b border-[#421d10] text-cream-100 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#3c1b11] border border-gold-500/40 p-1 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
              🍫
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-gold-300 transition-colors">
                  ZORA
                </span>
                <span className="font-serif text-2xl font-semibold italic text-gold-400">
                  SHOP
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-caramel-300 font-medium">
                Sweetness in Every Bite!
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors py-1 relative hover:text-gold-300 ${
                    active ? 'text-gold-400 font-bold' : 'text-cream-200'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Cart, Customer Profile Badge, Logout */}
          <div className="flex items-center gap-3">
            
            {/* My Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white shadow-md hover:shadow-lg transition-all text-xs font-bold"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">My Cart</span>
              {cartCount > 0 && (
                <span className="min-w-[18px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Profile Link Badge */}
            <Link
              to="/profile"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3c1b11] border border-[#522c1b] text-gold-300 hover:text-white text-xs font-semibold transition"
              title="View Customer Profile"
            >
              <User className="w-3.5 h-3.5 text-gold-400" />
              <span>{currentCustomer?.name?.split(' ')[0] || 'Profile'}</span>
            </Link>

            {/* Logout Button (Returns to First Screen) */}
            <button
              onClick={customerLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-900/60 text-red-200 text-xs font-semibold transition"
              title="Logout to First Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-cream-200 hover:text-white hover:bg-[#3c1b11] transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1c0c07] border-t border-[#421d10] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive(link.path)
                      ? 'bg-[#3c1b11] text-gold-400'
                      : 'text-cream-200 hover:bg-[#3c1b11]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#421d10] flex items-center justify-between text-xs">
              <span className="text-stone-400">
                Logged in as <strong>{currentCustomer?.name || 'Customer'}</strong>
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  customerLogout();
                }}
                className="text-red-400 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
