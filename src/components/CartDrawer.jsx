import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2
} from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    deliveryFee,
    shopSettings,
    addToast
  } = useShop();

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === shopSettings.promoCode) {
      const discount = Math.round((cartSubtotal * shopSettings.promoDiscountPercent) / 100);
      setAppliedPromo({
        code: shopSettings.promoCode,
        percent: shopSettings.promoDiscountPercent,
        discount
      });
      addToast(`Promo ${shopSettings.promoCode} applied! You saved ₹${discount} 🎉`);
    } else {
      addToast('Invalid promo code. Try ZORA10 for 10% off!', 'warning');
    }
  };

  const discountAmount = appliedPromo ? Math.round((cartSubtotal * appliedPromo.percent) / 100) : 0;
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const remainingForFreeDelivery = Math.max(0, shopSettings.freeDeliveryThreshold - cartSubtotal);

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout', { state: { appliedDiscount: discountAmount, promoCode: appliedPromo?.code } });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-chocolate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-chocolate-950 flex flex-col shadow-2xl border-l border-cream-300">
          
          {/* Header */}
          <div className="p-5 bg-chocolate-950 text-cream-100 flex items-center justify-between border-b border-chocolate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-400" />
              <h2 className="font-serif text-lg font-bold">Your Chocolate Box</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-caramel-600/40 text-gold-300 border border-gold-500/30">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-chocolate-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery notice bar */}
          <div className="bg-caramel-100/60 border-b border-caramel-200 px-4 py-2.5 text-xs text-chocolate-900 font-medium flex items-center justify-between">
            {remainingForFreeDelivery > 0 ? (
              <span>
                Add <strong className="text-caramel-700 font-bold">₹{remainingForFreeDelivery}</strong> more for <strong>FREE Delivery!</strong>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                You unlocked FREE Delivery! 🚚
              </span>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-cream-200 flex items-center justify-center text-4xl shadow-inner">
                  🍫
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-chocolate-900">
                    Your box is empty!
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Indulge in our handmade chocolates, crispy bites and royal fusion specials.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-md transition"
                >
                  <span>Explore Chocolates</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-cream-200">
                  <span>Selected Chocolates</span>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 p-3 bg-cream-100/70 rounded-2xl border border-cream-200 hover:border-caramel-300 transition"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image || '/chocolate-placeholder.svg'}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/chocolate-placeholder.svg';
                      }}
                      className="w-16 h-16 rounded-xl object-cover bg-chocolate-200 shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-bold text-chocolate-950 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-stone-400 hover:text-red-500 p-0.5 transition"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-white text-caramel-700 border border-caramel-200">
                        {item.packageName}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center border border-chocolate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.cartItemId, item.quantity - 1)}
                            className="p-1 px-1.5 hover:bg-cream-200 text-chocolate-800 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-chocolate-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.cartItemId, item.quantity + 1)}
                            className="p-1 px-1.5 hover:bg-cream-200 text-chocolate-800 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs font-bold text-chocolate-950">
                            ₹{item.total}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            ₹{item.unitPrice} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code Input */}
                <div className="pt-2">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Coupon code (try ZORA10)"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-cream-100 rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-caramel-500 uppercase font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-chocolate-900 text-gold-300 hover:bg-chocolate-950 text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </form>
                  {appliedPromo && (
                    <div className="mt-1.5 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <span>✓ {appliedPromo.code} applied ({appliedPromo.percent}% OFF)</span>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-stone-400 hover:text-red-500 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 bg-cream-50 border-t border-cream-300 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-chocolate-950">₹{cartSubtotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-chocolate-950">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 uppercase font-bold text-[11px]">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-cream-300 flex justify-between text-base font-bold text-chocolate-950">
                  <span>Grand Total</span>
                  <span className="font-serif text-lg text-caramel-700">₹{finalTotal}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-3 rounded-xl border border-chocolate-300 bg-white hover:bg-cream-100 text-xs font-bold text-chocolate-900 transition"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={handleProceedCheckout}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[10px] text-center text-stone-500">
                🔒 Safe & secure simulated checkout • 100% Homemade Freshness
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

