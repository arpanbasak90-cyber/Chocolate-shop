import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { api } from '../api/client';
import { loadRazorpayScript } from '../utils/razorpay';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  FileText,
  CreditCard,
  QrCode,
  AlertCircle,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export const CheckoutPage = () => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    placeOrder,
    currentCustomer,
    addToast
  } = useShop();

  const navigate = useNavigate();
  const location = useLocation();

  const appliedDiscount = location.state?.appliedDiscount || 0;
  const promoCode = location.state?.promoCode || '';

  // Delivery Address
  const [address, setAddress] = useState({
    house: '',
    street: '',
    landmark: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    instructions: ''
  });

  // Payment Options: 'COD' or 'RAZORPAY'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If cart is empty, redirect back
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - appliedDiscount);

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.house.trim() || !address.street.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setErrorMessage('Please fill in all required delivery address fields.');
      addToast('Please complete all delivery address fields', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Submit Checkout to Server (Backend verifies and recalculates totals from DB)
      const res = await placeOrder({
        address,
        paymentMethod,
        promoCode,
        notes: address.instructions
      });

      const order = res.order;
      const whatsappUrl = res.whatsappUrl;

      // 2A. If Cash on Delivery: Order is confirmed immediately!
      if (paymentMethod === 'COD') {
        setIsProcessing(false);
        navigate('/order-confirmation', {
          state: {
            order,
            whatsappUrl
          }
        });
        return;
      }

      // 2B. If Online Payment (Razorpay / UPI / Cards)
      if (paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI') {
        const rzpPayload = res.razorpayPayload;

        if (!rzpPayload || !rzpPayload.isAvailable) {
          // Razorpay keys not yet set in server/.env
          addToast('Razorpay credentials not set in server/.env. Order saved as Pending.', 'info');
          setIsProcessing(false);
          navigate('/order-confirmation', {
            state: {
              order,
              whatsappUrl,
              notice: 'Razorpay keys not yet configured in server/.env. Please configure keys to test live payment modal.'
            }
          });
          return;
        }

        // Load genuine Razorpay SDK
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setIsProcessing(false);
          setErrorMessage('Could not load Razorpay payment gateway. Please check your internet connection.');
          return;
        }

        // Configure genuine Razorpay Checkout Modal
        const options = {
          key: rzpPayload.keyId,
          amount: rzpPayload.amount,
          currency: rzpPayload.currency || 'INR',
          name: 'ZORA SHOP',
          description: `Order ${order.orderNumber} - Handcrafted Chocolates`,
          image: '/chocolate-placeholder.svg',
          order_id: rzpPayload.orderId,
          prefill: {
            name: currentCustomer?.name || '',
            email: currentCustomer?.email || '',
            contact: currentCustomer?.phone || ''
          },
          theme: {
            color: '#3c1b11'
          },
          handler: async function (response) {
            try {
              // Server-side HMAC Signature Verification
              const verifyRes = await api.verifyRazorpayPayment({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.success) {
                addToast('Payment verified successfully! 🎉');
                navigate('/order-confirmation', {
                  state: {
                    order: { ...order, paymentStatus: 'Paid', orderStatus: 'Confirmed' },
                    whatsappUrl
                  }
                });
              } else {
                setErrorMessage('Payment verification failed on the server.');
              }
            } catch (err) {
              setErrorMessage('Payment verification error: ' + err.message);
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              addToast('Payment window closed. Order saved as Pending.', 'info');
              navigate('/order-confirmation', {
                state: { order, whatsappUrl }
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to place order.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-300 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-caramel-600">
            Secure Production Checkout
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3c1b11]">
            Complete Your Chocolate Order
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Customer: <strong>{currentCustomer?.name}</strong></span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handlePlaceOrderSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT 7 COLS: ADDRESS & PAYMENT OPTIONS */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Customer Verified Account Info */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <span className="text-xs font-bold text-[#3c1b11] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Customer Profile</span>
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                  Email Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Name:</span>
                  <strong className="text-chocolate-950 font-medium">{currentCustomer?.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Email:</span>
                  <strong className="text-chocolate-950 font-medium">{currentCustomer?.email}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Mobile:</span>
                  <strong className="text-chocolate-950 font-medium">{currentCustomer?.phone}</strong>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
                <MapPin className="w-4 h-4 text-caramel-600" />
                <h3 className="font-serif text-base font-bold text-[#3c1b11]">
                  Delivery Address
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">House / Flat / Building *</label>
                  <input
                    type="text"
                    required
                    value={address.house}
                    onChange={(e) => setAddress({ ...address, house: e.target.value })}
                    placeholder="e.g. Flat 302, Royal Residency"
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium focus:ring-2 focus:ring-caramel-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Street / Locality *</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="e.g. Near Sindhu Bhavan Road, Bodakdev"
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium focus:ring-2 focus:ring-caramel-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="e.g. Opposite Cafe"
                      className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
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
                      className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={address.instructions}
                    onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                    placeholder="e.g. Ring doorbell twice, deliver chilled"
                    className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-950"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Options */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
                <CreditCard className="w-4 h-4 text-caramel-600" />
                <h3 className="font-serif text-base font-bold text-[#3c1b11]">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#3c1b11] bg-caramel-50/50 shadow-sm'
                      : 'border-cream-300 hover:border-caramel-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#3c1b11]">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#3c1b11]"
                    />
                  </div>
                  <p className="text-xs text-stone-600">
                    Pay with cash when your fresh chocolate order arrives at your door.
                  </p>
                </label>

                {/* Option B: Online Payment via Razorpay */}
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI'
                      ? 'border-[#3c1b11] bg-caramel-50/50 shadow-sm'
                      : 'border-cream-300 hover:border-caramel-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#3c1b11]">Online Payment</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">UPI / Cards</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="accent-[#3c1b11]"
                    />
                  </div>
                  <p className="text-xs text-stone-600">
                    Instant UPI QR, Google Pay, PhonePe, Cards, Net Banking via Razorpay.
                  </p>
                </label>
              </div>

              {paymentMethod === 'COD' ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  💵 Please keep exact cash of <strong>₹{grandTotal}</strong> ready upon delivery.
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secure 256-bit encrypted transaction verified directly by backend signature.</span>
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

            {/* Server-Side Calculated Totals */}
            <div className="pt-3 border-t border-cream-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-chocolate-950">₹{cartSubtotal}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {promoCode ? `(${promoCode})` : ''}</span>
                  <span>-₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-chocolate-950">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-cream-200 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-[#3c1b11]">Total Payable</span>
                <span className="font-serif font-extrabold text-2xl text-[#3c1b11]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (₹{grandTotal})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/shop"
                className="w-full py-2.5 mt-2 text-xs font-semibold text-stone-500 hover:text-chocolate-950 text-center block"
              >
                ← Back to Chocolates Menu
              </Link>
            </div>

            <div className="text-[11px] text-center text-stone-400">
              🔒 100% Secure Checkout • Pure Vegetarian Homemade Chocolates
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
