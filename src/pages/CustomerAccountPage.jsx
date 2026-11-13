import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShoppingBag,
  Sparkles,
  Clock,
  LogOut,
  Edit3,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const CustomerAccountPage = () => {
  const {
    currentCustomer,
    sendCustomerOtp,
    verifyCustomerOtp,
    updateCustomerProfile,
    customerLogout,
    orders,
    setActiveOrderId,
    addToast
  } = useShop();

  const navigate = useNavigate();

  // Email OTP Auth Step: 1 = Enter Details, 2 = Verify Email OTP
  const [authStep, setAuthStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [devCodeInfo, setDevCodeInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Edit profile toggle
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Handle Step 1: Request Email OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setDevCodeInfo('');
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please fill in your Full Name and Email address.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendCustomerOtp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '9898014090'
      });
      setAuthStep(2);
      setCountdown(300);
      setEmailOtp('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify Email OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailOtp.trim()) {
      setErrorMessage('Please enter the 6-digit Email OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyCustomerOtp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        emailOtp: emailOtp.trim()
      });
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setEditForm({
      name: currentCustomer?.name || '',
      email: currentCustomer?.email || '',
      phone: currentCustomer?.phone || '',
      address: { ...(currentCustomer?.address || {}) }
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateCustomerProfile(editForm);
    setIsEditing(false);
  };

  // Customer's orders safely filtered
  const customerOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    if (!currentCustomer?.email) return false;
    const custEmail = o?.customer?.email || '';
    const custPhone = o?.customer?.phone || '';
    return (
      (custEmail && custEmail.toLowerCase() === currentCustomer.email.toLowerCase()) ||
      (custPhone && custPhone === currentCustomer.phone)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* 1. NOT LOGGED IN VIEW: DUAL OTP AUTHENTICATION */}
      {!currentCustomer ? (
        <div className="max-w-md mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-chocolate-950 flex items-center justify-center text-3xl shadow-xl border border-gold-400/40">
              🍫
            </div>
            <h1 className="font-serif text-3xl font-bold text-chocolate-950">
              Customer Account Portal
            </h1>
            <p className="text-xs text-stone-500">
              Secure Email OTP Verification. Sign in or register in seconds.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-xl space-y-5 animate-fadeIn">
            {authStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="pb-3 border-b border-cream-200">
                  <h3 className="font-serif text-lg font-bold text-chocolate-950">
                    Enter Contact Details
                  </h3>
                  <p className="text-xs text-stone-500">
                    We will send a 6-digit verification code to your email address.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}


                <div>
                  <label className="block text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Radhika Mehta"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 focus:outline-none focus:ring-2 focus:ring-caramel-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 focus:outline-none focus:ring-2 focus:ring-caramel-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-1">
                    Mobile Number (Contact & Orders) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 focus:outline-none focus:ring-2 focus:ring-caramel-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="pb-3 border-b border-cream-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-chocolate-950">
                      Verify Email OTP
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAuthStep(1)}
                      className="text-xs text-caramel-700 hover:underline font-bold"
                    >
                      Change Details
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Code sent to <strong>{email}</strong>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}


                <div>
                  <label className="block text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-1">
                    Email OTP (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter 6-digit email code"
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-center font-mono tracking-widest text-chocolate-950 focus:outline-none focus:ring-2 focus:ring-caramel-400"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    {countdown > 0 ? (
                      `Code expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                    ) : (
                      <span className="text-red-600 font-bold">Code expired</span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 240 || isLoading}
                    onClick={handleRequestOtp}
                    className="text-caramel-700 font-bold hover:underline disabled:opacity-40"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Access Customer Account</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      ) : (
        /* 2. LOGGED IN CUSTOMER DASHBOARD */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Customer Hero Card */}
          <div className="bg-gradient-to-r from-chocolate-950 via-chocolate-900 to-chocolate-950 text-cream-100 rounded-3xl p-6 sm:p-8 border border-gold-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 gold-glow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-caramel-500 to-gold-400 p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-chocolate-900 flex items-center justify-center text-3xl">
                  🍫
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 font-bold uppercase tracking-wider">
                    VIP Choco Lover
                  </span>
                  <span className="text-xs text-stone-400">Member since {currentCustomer.joinedDate || '2026'}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Welcome, {currentCustomer.name}!
                </h2>
                <p className="text-xs text-caramel-200 mt-0.5">
                  Your address is saved and ready for 1-click chocolate delivery.
                </p>
              </div>
            </div>

            {/* Sweet Points & Logout */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-chocolate-900/90 border border-gold-500/30 text-center">
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  Sweet Loyalty Points
                </div>
                <div className="font-serif text-xl font-bold text-gold-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>{currentCustomer.sweetPoints || 320} Pts</span>
                </div>
              </div>

              <button
                onClick={customerLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-chocolate-900 hover:bg-chocolate-800 text-stone-300 hover:text-white border border-chocolate-700 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Recorded Customer Details & Saved Address */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="font-serif text-lg font-bold text-chocolate-950 flex items-center gap-2">
                  <User className="w-4 h-4 text-caramel-600" />
                  <span>Recorded Profile & Address</span>
                </h3>
                {!isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1 text-xs text-caramel-700 hover:underline font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* View Mode */}
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Contact Details
                    </div>
                    <div className="font-bold text-chocolate-950 text-sm">
                      {currentCustomer?.name || 'Customer'}
                    </div>
                    <div className="text-stone-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-caramel-600" />
                      <span>{currentCustomer?.email || 'N/A'}</span>
                    </div>
                    <div className="text-stone-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-caramel-600" />
                      <span>+91 {currentCustomer?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>Default Delivery Address</span>
                      <span className="text-emerald-700 font-bold text-[10px]">✓ Active</span>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-medium">
                      {currentCustomer?.address?.house || 'Address not set'}, {currentCustomer?.address?.street || ''}
                      {currentCustomer?.address?.landmark && `, ${currentCustomer.address.landmark}`}
                      <br />
                      {currentCustomer?.address?.city || ''}, {currentCustomer?.address?.state || ''} - {currentCustomer?.address?.pincode || ''}
                    </p>
                    {currentCustomer?.address?.instructions && (
                      <p className="text-[11px] text-stone-500 italic">
                        Note: {currentCustomer.address.instructions}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This recorded address is automatically loaded at checkout!</span>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Phone (+91)</label>
                      <input
                        type="tel"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">House / Flat No.</label>
                    <input
                      type="text"
                      required
                      value={editForm.address.house}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: { ...editForm.address, house: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Street / Locality</label>
                    <input
                      type="text"
                      required
                      value={editForm.address.street}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: { ...editForm.address, street: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={editForm.address.city}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: { ...editForm.address, city: e.target.value }
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={editForm.address.state}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: { ...editForm.address, state: e.target.value }
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">PIN</label>
                      <input
                        type="text"
                        required
                        value={editForm.address.pincode}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: { ...editForm.address, pincode: e.target.value }
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-cream-50 border border-cream-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl border border-cream-300 text-stone-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-chocolate-900 text-gold-300 text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2">
                <Link
                  to="/shop"
                  className="w-full py-2.5 px-4 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                  <span>Order More Fresh Chocolates</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Customer's Orders & Quick Tracking */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="font-serif text-lg font-bold text-chocolate-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-caramel-600" />
                  <span>My Chocolate Orders</span>
                </h3>
                <span className="text-xs text-stone-500">
                  {customerOrders.length} {customerOrders.length === 1 ? 'order' : 'orders'} placed
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">🍫</div>
                  <h4 className="font-serif font-bold text-chocolate-900">
                    No orders placed yet!
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our handmade Rasmalai, Almond Bites, and Classic chocolates.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-chocolate-900 text-gold-300 font-bold text-xs"
                  >
                    <span>Browse Chocolate Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-cream-50 border border-cream-200 hover:border-caramel-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-cream-200">
                        <div>
                          <span className="font-mono font-bold text-chocolate-950 text-sm">
                            #{ord.id}
                          </span>
                          <span className="text-stone-400 text-xs ml-2">
                            • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-caramel-100 text-caramel-800 border border-caramel-300 self-start sm:self-auto">
                          {ord.orderStatus}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img src={it.image} alt={it.name} className="w-7 h-7 rounded-lg object-cover" />
                              <span className="text-chocolate-950 font-medium">
                                {it.quantity}× {it.name}{' '}
                                <span className="text-stone-500 text-[11px]">({it.packageName})</span>
                              </span>
                            </div>
                            <span className="font-bold text-chocolate-900">₹{it.total}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Tracking Button */}
                      <div className="pt-2 border-t border-cream-200 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-stone-500">Total: </span>
                          <span className="font-bold text-caramel-700 font-serif text-sm">₹{ord.grandTotal}</span>
                          <span className="text-stone-400 text-[10px] ml-1">({ord.paymentMethod})</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveOrderId(ord.id);
                            navigate('/track');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-[11px] transition shadow-xs"
                        >
                          <span>Track Status</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

