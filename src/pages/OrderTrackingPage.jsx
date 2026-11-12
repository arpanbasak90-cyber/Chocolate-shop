import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { api } from '../api/client';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { orders, activeOrderId, setActiveOrderId, updateOrderStatus, shopSettings, isAdminLoggedIn, addToast } = useShop();
  const [searchInput, setSearchInput] = useState(activeOrderId || '');
  const [remoteOrder, setRemoteOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Look up order by ID locally or from remote search
  const selectedOrder = remoteOrder || orders.find(
    (o) => (o.orderNumber || o.id || '').toLowerCase() === searchInput.trim().toLowerCase()
  ) || orders.find((o) => o.id === activeOrderId) || orders[0];

  useEffect(() => {
    if (activeOrderId && !remoteOrder) {
      setSearchInput(activeOrderId);
    }
  }, [activeOrderId, remoteOrder]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      addToast('Please enter an Order Number or ID to track', 'warning');
      return;
    }

    // 1. Check local orders first
    const foundLocal = orders.find(
      (o) => (o.orderNumber || o.id || '').toLowerCase() === query.toLowerCase()
    );
    if (foundLocal) {
      setRemoteOrder(foundLocal);
      setActiveOrderId(foundLocal.id);
      addToast(`Showing live tracking for Order #${foundLocal.orderNumber || foundLocal.id}`);
      return;
    }

    // 2. Fetch from backend tracking API
    setIsSearching(true);
    try {
      const res = await api.trackOrder(query);
      if (res.success && res.order) {
        setRemoteOrder(res.order);
        setActiveOrderId(res.order.id);
        addToast(`Order #${res.order.orderNumber || res.order.id} found!`, 'success');
      } else {
        setRemoteOrder(null);
        addToast(`Order "${query}" not found in database.`, 'warning');
      }
    } catch (err) {
      setRemoteOrder(null);
      addToast(err.message || `Order "${query}" not found.`, 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  const statusSteps = [
    { name: 'Order Placed', desc: 'Order received by boutique kitchen', icon: Package },
    { name: 'Order Confirmed', desc: 'Ingredients & chocolates allocated', icon: CheckCircle2 },
    { name: 'Preparing Your Chocolates', desc: 'Small-batch tempering & gift wrapping', icon: Clock },
    { name: 'Out for Delivery', desc: 'On its way in chilled insulated bag', icon: Truck },
    { name: 'Delivered', desc: 'Handed over fresh & delicious', icon: Home },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.name === selectedOrder?.orderStatus
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-caramel-600 uppercase tracking-widest">
          Live Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-chocolate-950">
          Track Your Chocolate Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Enter your Order Number (e.g. ZS-1731405000000) to follow your handmade chocolates in real time.
        </p>
      </div>

      {/* Order Search Bar */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Order Number or ID..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-cream-300 text-xs text-chocolate-950 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-caramel-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-3 rounded-2xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Track</span>
          </button>
        </form>

        {/* Quick order chips if customer has orders */}
        {(orders || []).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-stone-500">
            <span>Your Recent Orders:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchInput(o.orderNumber || o.id);
                  setRemoteOrder(o);
                  setActiveOrderId(o.id);
                }}
                className="px-2 py-0.5 rounded-lg bg-cream-200 text-chocolate-900 font-mono text-[11px] hover:bg-cream-300 font-bold"
              >
                #{o.orderNumber || o.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-lg space-y-8">
          
          {/* Order Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cream-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xl font-bold text-chocolate-950">
                  #{selectedOrder.orderNumber || selectedOrder.id}
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-caramel-100 text-caramel-800 border border-caramel-300">
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Customer: <strong>{selectedOrder.customer?.name}</strong> • +91 {selectedOrder.customer?.phone}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-cream-200 sm:pl-6">
              <div className="text-xs text-stone-500">Total Order Amount</div>
              <div className="font-serif text-xl font-bold text-chocolate-950">
                ₹{selectedOrder.grandTotal}
              </div>
              <div className="text-[11px] text-stone-500">
                {(selectedOrder.items || []).length} items • {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-chocolate-900 mb-6">
              Order Fulfillment Progress
            </h4>

            <div className="relative">
              {/* Stepper Line */}
              <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-cream-200 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-caramel-600 to-gold-400 transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      0,
                      (currentStatusIndex / (statusSteps.length - 1)) * 100
                    )}%`
                  }}
                ></div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const historyItem = (selectedOrder.statusHistory || []).find((h) => h.status === step.name);
                  const stepTime = historyItem
                    ? new Date(historyItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : isCompleted ? 'Completed' : 'Pending';

                  return (
                    <div key={step.name} className="flex md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-2">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                          isCompleted
                            ? 'bg-chocolate-950 border-gold-400 text-gold-300 shadow-md scale-105'
                            : 'bg-white border-cream-300 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <div
                          className={`font-serif text-xs sm:text-sm font-bold ${
                            isCompleted ? 'text-chocolate-950' : 'text-stone-400'
                          }`}
                        >
                          {step.name}
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight hidden md:block mt-0.5">
                          {step.desc}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-cream-200 text-chocolate-900 font-semibold'
                              : 'text-stone-400'
                          }`}
                        >
                          {stepTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Owner Quick Controls (Visible only when logged in as Shopkeeper) */}
          {isAdminLoggedIn && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Shopkeeper Control: Update Live Order Status</span>
                </span>
                <span className="text-[11px] text-amber-800">
                  Owner Admin Mode
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusSteps.map((step) => (
                  <button
                    key={step.name}
                    onClick={() => updateOrderStatus(selectedOrder.id, step.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedOrder.orderStatus === step.name
                        ? 'bg-chocolate-900 text-gold-300 ring-2 ring-gold-400 shadow-sm'
                        : 'bg-white text-chocolate-800 border border-cream-300 hover:bg-cream-200'
                    }`}
                  >
                    {step.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Details & Items breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-200">
            <div>
              <h5 className="font-serif text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-2">
                Delivery Destination
              </h5>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-stone-700 leading-relaxed">
                <strong>{selectedOrder.customer?.name}</strong>
                <br />
                {selectedOrder.address?.house}, {selectedOrder.address?.street}
                <br />
                {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                {selectedOrder.address?.instructions && (
                  <p className="text-[11px] text-stone-500 italic mt-1">
                    "{selectedOrder.address.instructions}"
                  </p>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-serif text-xs font-bold text-chocolate-950 uppercase tracking-wider mb-2">
                Chocolates in this Delivery
              </h5>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-cream-50">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image || '/chocolate-placeholder.svg'}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/chocolate-placeholder.svg';
                        }}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span>
                        {item.quantity}× {item.name} ({item.packageName})
                      </span>
                    </div>
                    <span className="font-bold text-chocolate-950">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need help footer */}
          <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
            <span>Questions about your batch? We're available on WhatsApp.</span>
            <a
              href={`https://wa.me/${(shopSettings?.whatsappNumber || '919898014090').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Zora Shop, I am checking the status for order #${selectedOrder.orderNumber || selectedOrder.id}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask Shop Support</span>
            </a>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300">
          <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg font-bold text-chocolate-950">
            Order Not Found
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Please check the Order ID or Order Number and try again.
          </p>
        </div>
      )}

    </div>
  );
};

