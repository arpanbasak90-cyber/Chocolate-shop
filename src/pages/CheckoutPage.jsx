import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  FileText,
  CreditCard,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  User,
  ShoppingBag
} from 'lucide-react';

export const CheckoutPage = () => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    placeOrder,
    currentCustomer,
    shopSettings,
    addToast
  } = useShop();

  const navigate = useNavigate();
  const location = useLocation();

  const appliedDiscount = location.state?.appliedDiscount || 0;

  // Customer Information (Pre-filled from currentCustomer!)
  const [customer, setCustomer] = useState({
    name: currentCustomer?.name || '',
    email: currentCustomer?.email || '',
    phone: currentCustomer?.phone || ''
  });

  // Delivery Address
  const [address, setAddress] = useState({
    house: currentCustomer?.address?.house || '',
    street: currentCustomer?.address?.street || '',
    landmark: currentCustomer?.address?.landmark || '',
    city: currentCustomer?.address?.city || 'Pune',
    state: currentCustomer?.address?.state || 'Maharashtra',
    pincode: currentCustomer?.address?.pincode || '411014',
    instructions: currentCustomer?.address?.instructions || ''
  });

  // Payment Options: 'COD' or 'UPI'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulatedUpiPaid, setSimulatedUpiPaid] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  // If cart is empty, redirect back
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - appliedDiscount);

  const handleCopyUPI = () => {
    navigator.clipboard?.writeText('zorashop@upi');
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
    addToast('Demo UPI ID copied: zorashop@upi');
  };

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      addToast('Please provide your name, email and phone number', 'warning');
      return;
    }

    if (!address.house.trim() || !address.street.trim() || !address.city.trim() || !address.pincode.trim()) {
      addToast('Please complete all required delivery address fields', 'warning');
      return;
    }

    if (paymentMethod === 'UPI' && !simulatedUpiPaid) {
      addToast('Please click "Simulate Payment Success" or select Cash on Delivery', 'warning');
      return;
    }

    setIsPlacing(true);
    setTimeout(() => {
      const order = placeOrder({
        customer,
        address,
        paymentMethod,
        discount: appliedDiscount
      });
      setIsPlacing(false);
      navigate('/order-confirmation', { state: { orderId: order.id } });
    }, 700);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-300 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-caramel-600">
            Secure Checkout
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3c1b11]">
            Complete Your Chocolate Order
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Demo Simulation Mode</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrderSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT 7 COLS: CUSTOMER INFO, ADDRESS, PAYMENT */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. CUSTOMER INFORMATION */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <h3 className="font-serif text-base font-bold text-[#3c1b11] flex items-center gap-2">
                  <User className="w-4 h-4 text-caramel-600" />
                  <span>1. Customer Information</span>
                </h3>
                {currentCustomer && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓ Pre-filled from Account
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-1 focus:ring-caramel-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="priya@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-1 focus:ring-caramel-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="9823456789"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium focus:outline-none focus:ring-1 focus:ring-caramel-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. DELIVERY ADDRESS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <h3 className="font-serif text-base font-bold text-[#3c1b11] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-caramel-600" />
                  <span>2. Delivery Address</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">House / Flat No. *</label>
                    <input
                      type="text"
                      required
                      value={address.house}
                      onChange={(e) => setAddress({ ...address, house: e.target.value })}
                      placeholder="e.g. Flat 402, Sunshine Heights"
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Street & Locality *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Near Jogger’s Park, Viman Nagar"
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Landmark</label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="Opp Cafe Mocha"
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={address.instructions}
                    onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                    placeholder="e.g. Ring bell twice, deliver after 4 PM"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950"
                  />
                </div>
              </div>
            </div>

            {/* 3. PAYMENT OPTIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <h3 className="font-serif text-base font-bold text-[#3c1b11] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-caramel-600" />
                  <span>3. Select Payment Option</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border text-left transition-all ${paymentMethod === 'UPI'
                      ? 'border-caramel-500 bg-caramel-50/70 ring-2 ring-caramel-400'
                      : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                >
                  <div className="font-bold text-sm text-[#3c1b11] flex items-center gap-1.5">
                    <span>📱</span>
                    <span>UPI Payment</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Scan simulated QR or pay via GPay / PhonePe
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left transition-all ${paymentMethod === 'COD'
                      ? 'border-caramel-500 bg-caramel-50/70 ring-2 ring-caramel-400'
                      : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                >
                  <div className="font-bold text-sm text-[#3c1b11] flex items-center gap-1.5">
                    <span>💵</span>
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Pay cash upon delivery of fresh chocolates
                  </p>
                </button>
              </div>

              {/* UPI INTERFACE (When UPI selected) */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-cream-100/90 border border-caramel-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chocolate-900">
                      Simulated UPI Payment Screen
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      Demo Only
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-cream-200">
                    {/* QR Code SVG */}
                    <div className="w-24 h-24 p-1.5 border border-dashed border-chocolate-800 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" fill="#1e0f0b" />
                        <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" fill="#1e0f0b" />
                        <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#1e0f0b" />
                        <rect x="38" y="10" width="8" height="20" fill="#ca651b" />
                        <rect x="52" y="5" width="10" height="15" fill="#1e0f0b" />
                        <rect x="38" y="38" width="24" height="24" rx="4" fill="#1e0f0b" />
                        <rect x="44" y="44" width="12" height="12" fill="#f59e0b" />
                        <rect x="70" y="45" width="20" height="8" fill="#1e0f0b" />
                        <rect x="75" y="70" width="15" height="15" fill="#ca651b" />
                      </svg>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left text-xs">
                      <div>
                        <span className="text-stone-500 text-[11px]">UPI ID:</span>{' '}
                        <code className="font-mono font-bold text-chocolate-950 bg-cream-200 px-2 py-0.5 rounded">
                          zorashop@upi
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className="ml-2 text-caramel-700 font-bold hover:underline"
                        >
                          {upiCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSimulatedUpiPaid(true);
                          addToast('UPI Payment Simulation successful! ✓');
                        }}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition ${simulatedUpiPaid
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-sm'
                          }`}
                      >
                        {simulatedUpiPaid ? '✓ Payment Simulated (Paid)' : 'Simulate Payment Success'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-stone-500">
                    ⚠️ Demo notice: No actual financial transaction takes place.
                  </p>
                </div>
              )}

              {/* COD NOTICE */}
              {paymentMethod === 'COD' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  💵 Please keep exact cash of <strong>₹{grandTotal}</strong> ready upon delivery.
                </div>
              )}

            </div>

          </div>

          {/* RIGHT 5 COLS: FINAL ORDER SUMMARY & SUBMIT */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-md space-y-5 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif text-base font-bold text-[#3c1b11] flex items-center gap-2">
                <FileText className="w-4 h-4 text-caramel-600" />
                <span>Order Summary</span>
              </h3>
              <span className="text-xs text-stone-500">{cart.length} items</span>
            </div>

            {/* Chocolates in Basket */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
              {cart.map((it) => (
                <div key={it.cartItemId} className="flex items-center gap-3 text-xs">
                  <img
                    src={it.image || '/chocolate-placeholder.svg'}
                    alt={it.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/chocolate-placeholder.svg';
                    }}
                    className="w-12 h-12 rounded-xl object-cover bg-chocolate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-chocolate-950 truncate">{it.name}</h5>
                    <p className="text-[11px] text-stone-500">{it.quantity}x {it.packageName}</p>
                  </div>
                  <div className="font-bold text-chocolate-950">₹{it.total}</div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-cream-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-chocolate-950">₹{cartSubtotal}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-chocolate-950">
                  {deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-cream-200 flex justify-between text-base font-bold text-chocolate-950">
                <span>Grand Total</span>
                <span className="font-serif text-xl text-caramel-700">₹{grandTotal}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPlacing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isPlacing ? 'Confirming Order...' : `Confirm Order • ₹${grandTotal}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[10px] text-center text-stone-400">
              🔒 Safe & simulated checkout • Fresh homemade preparation
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
