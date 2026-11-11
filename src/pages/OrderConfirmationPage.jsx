import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { orders, activeOrderId, setActiveOrderId, shopSettings, addToast } = useShop();
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId || activeOrderId;
  const currentOrder = orders.find((o) => o.id === orderId) || orders[0];

  const [copiedMessage, setCopiedMessage] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ca651b', '#d4a017', '#1e0f0b', '#f9cb97']
      });
    } catch (e) {
      console.log('Confetti not available', e);
    }
  }, []);

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold">No recent order found</h2>
        <Link to="/shop" className="text-caramel-600 underline mt-2 inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Format WhatsApp message text
  const itemsText = currentOrder.items
    .map((item) => `• ${item.quantity}x ${item.name} (${item.packageName}) - ₹${item.total}`)
    .join('\n');

  const formattedWhatsAppText = `*🍫 NEW ORDER - ZORA SHOP*
*Order ID:* #${currentOrder.id}
*Customer:* ${currentOrder.customer.name}
*Phone:* ${currentOrder.customer.phone}
*Address:* ${currentOrder.address.house}, ${currentOrder.address.street}, ${currentOrder.address.city} - ${currentOrder.address.pincode}

*Chocolates Ordered:*
${itemsText}

*Items Subtotal:* ₹${currentOrder.subtotal}
*Delivery Fee:* ₹${currentOrder.deliveryFee}
${currentOrder.discount > 0 ? `*Discount:* -₹${currentOrder.discount}\n` : ''}*Grand Total:* ₹${currentOrder.grandTotal}
*Payment Method:* ${currentOrder.paymentMethod} (${currentOrder.paymentStatus})

_Thank you for ordering with ZORA SHOP! Sweetness in Every Bite!_`;

  const encodedWhatsAppUrl = `https://wa.me/${shopSettings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    formattedWhatsAppText
  )}`;

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(formattedWhatsAppText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    addToast('WhatsApp message template copied to clipboard! 📋');
  };

  const handleTrackThisOrder = () => {
    setActiveOrderId(currentOrder.id);
    navigate('/track');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      
      {/* Top Success Banner */}
      <div className="bg-gradient-to-br from-chocolate-950 via-chocolate-900 to-chocolate-950 text-cream-100 rounded-3xl p-8 sm:p-12 text-center border-2 border-gold-500/40 shadow-2xl relative overflow-hidden gold-glow">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-caramel-500 to-gold-400 p-1 mb-5 flex items-center justify-center shadow-lg">
          <div className="w-full h-full rounded-full bg-chocolate-950 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-gold-400" />
          </div>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-widest mb-3 border border-gold-500/30">
          Order Confirmed & Placed!
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Thank You, {currentOrder.customer.name}!
        </h1>
        <p className="text-sm text-caramel-200 max-w-lg mx-auto">
          Your homemade chocolates are being queued for fresh small-batch tempering.
        </p>

        {/* Order Number Badge */}
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-chocolate-900/90 border border-gold-400/40">
          <span className="text-xs text-stone-400">Order Reference:</span>
          <span className="font-mono text-lg sm:text-xl font-bold text-gold-300 tracking-wider">
            #{currentOrder.id}
          </span>
        </div>

        {/* Estimated delivery banner */}
        <div className="mt-6 text-xs text-caramel-300/90 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-gold-400" />
          <span>
            <strong>Estimated Delivery:</strong> Within 24-48 Hours (Illustrative Demo Schedule)
          </span>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-chocolate-950">
              Order Summary & Items
            </h3>
            <p className="text-xs text-stone-500">
              Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
              {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={handleTrackThisOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-sm transition"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Items List */}
        <div className="divide-y divide-cream-200">
          {currentOrder.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-chocolate-100 shrink-0"
                />
                <div>
                  <h4 className="font-serif font-bold text-sm text-chocolate-950">
                    {item.name}
                  </h4>
                  <div className="text-xs text-stone-500">
                    <span className="font-semibold text-chocolate-800">{item.packageName}</span> • {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-chocolate-950">
                  ₹{item.total}
                </div>
                <div className="text-[11px] text-stone-400">
                  ₹{item.unitPrice} each
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-cream-200 space-y-1.5 text-xs text-stone-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-chocolate-950">₹{currentOrder.subtotal}</span>
          </div>
          {currentOrder.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-₹{currentOrder.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-chocolate-950">
              {currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee}`}
            </span>
          </div>
          <div className="pt-2 border-t border-cream-200 flex justify-between text-base font-bold text-chocolate-950">
            <span>Grand Total</span>
            <span className="font-serif text-lg text-caramel-700">₹{currentOrder.grandTotal}</span>
          </div>
          <div className="text-[11px] text-right text-stone-500 pt-1">
            Paid via: <strong className="text-chocolate-900">{currentOrder.paymentMethod}</strong> ({currentOrder.paymentStatus})
          </div>
        </div>

        {/* Delivery Address Box */}
        <div className="pt-4 border-t border-cream-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200">
            <h5 className="font-serif font-bold text-xs text-chocolate-950 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-caramel-600" />
              <span>Delivery Address</span>
            </h5>
            <p className="text-xs text-stone-700 leading-relaxed">
              {currentOrder.address.house}, {currentOrder.address.street}
              {currentOrder.address.landmark && `, ${currentOrder.address.landmark}`}
              <br />
              {currentOrder.address.city}, {currentOrder.address.state} - {currentOrder.address.pincode}
            </p>
            {currentOrder.address.instructions && (
              <p className="text-[11px] text-stone-500 italic mt-1">
                Note: {currentOrder.address.instructions}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200">
            <h5 className="font-serif font-bold text-xs text-chocolate-950 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-caramel-600" />
              <span>Customer Details</span>
            </h5>
            <p className="text-xs text-stone-700 leading-relaxed">
              <strong>Name:</strong> {currentOrder.customer.name}
              <br />
              <strong>Phone:</strong> {currentOrder.customer.phone}
              <br />
              <strong>Email:</strong> {currentOrder.customer.email}
            </p>
          </div>
        </div>

      </div>

      {/* WHATSAPP ORDER NOTIFICATION PREVIEW SECTION (Section 11 Requirement) */}
      <div className="bg-emerald-950 text-cream-100 rounded-3xl p-6 sm:p-8 border-2 border-emerald-700/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Section 11: Real-time Notification Demo
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                WhatsApp Order Dispatch Preview
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-emerald-200 transition"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'Copied' : 'Copy Text'}</span>
            </button>

            <a
              href={encodedWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Formatted Message Bubble Preview */}
        <div className="bg-emerald-900/60 p-4 sm:p-5 rounded-2xl border border-emerald-800/80 font-mono text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed shadow-inner">
          {formattedWhatsAppText}
        </div>

        <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800 text-[11px] text-emerald-300/90 leading-relaxed">
          ℹ️ <strong>Developer Note for ZORA SHOP Owner:</strong> In production, this notification is triggered automatically to the shop owner & customer using the official <strong>WhatsApp Business Cloud API</strong> via webhooks immediately after checkout!
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={handleTrackThisOrder}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-md transition"
        >
          <Clock className="w-4 h-4 text-gold-400" />
          <span>Track Live Status (#{currentOrder.id})</span>
        </button>

        <Link
          to="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-chocolate-300 bg-white hover:bg-cream-100 text-chocolate-900 font-bold text-xs transition"
        >
          <ShoppingBag className="w-4 h-4 text-caramel-600" />
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
};

