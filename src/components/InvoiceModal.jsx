import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { api } from '../api/client';
import {
  X,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Store,
  MapPin,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';

export const InvoiceModal = ({ isOpen, orderId, onClose }) => {
  const { downloadInvoicePdf } = useShop();

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) {
      setInvoice(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInvoice = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getOrderInvoice(orderId);
        if (isMounted) {
          if (res?.success && res.invoice) {
            setInvoice(res.invoice);
          } else {
            setError(res?.message || 'Invoice details not available.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load invoice details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInvoice();

    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!orderId || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(orderId, invoice?.invoiceNumber);
    } finally {
      setIsDownloading(false);
    }
  };

  const snapshot = invoice?.snapshot || {};
  const shop = snapshot.shop || {};
  const customer = snapshot.customer || invoice?.customer || {};
  const address = snapshot.deliveryAddress || (invoice?.order && invoice.order.address) || null;
  const items = Array.isArray(snapshot.items) && snapshot.items.length > 0
    ? snapshot.items
    : (invoice?.order && Array.isArray(invoice.order.items) ? invoice.order.items : []);
  const financials = snapshot.financials || {};
  const payment = snapshot.payment || {};

  const invoiceNumber = invoice?.invoiceNumber || snapshot.invoiceNumber || 'INV-PENDING';
  const orderNumber = (snapshot.order && snapshot.order.orderNumber) || (invoice?.order && invoice.order.orderNumber) || orderId;

  const subtotal = Number(financials.subtotal ?? invoice?.subtotal ?? 0);
  const deliveryFee = Number(financials.deliveryFee ?? invoice?.deliveryFee ?? 0);
  const discount = Number(financials.discount ?? invoice?.discount ?? 0);
  const grandTotal = Number(financials.grandTotal ?? invoice?.grandTotal ?? 0);

  const paymentMethod = payment.method || invoice?.paymentMethod || 'COD';
  const paymentStatus = payment.status || invoice?.paymentStatus || 'Pending (Cash on Delivery)';
  const isCod = paymentMethod.toUpperCase().includes('COD') || paymentMethod.toUpperCase().includes('CASH');

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return String(dateInput);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-chocolate-950/80 backdrop-blur-md animate-fadeIn"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 bg-cream-50 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-cream-300 flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-[#2b130a] px-5 sm:px-6 py-4 border-b border-[#421d10] flex items-center justify-between text-cream-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-caramel-500/20 border border-caramel-400/30 flex items-center justify-center text-caramel-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-caramel-400">
                Official Receipt
              </div>
              <h3 id="invoice-modal-title" className="font-serif text-lg font-bold text-white leading-tight">
                Invoice {invoice ? invoiceNumber : ''}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-caramel-600 hover:bg-caramel-500 text-white font-bold text-xs transition disabled:opacity-50 shadow-xs"
                title="Download PDF Invoice"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close invoice dialog"
              className="w-8 h-8 rounded-full bg-[#3c1b11] hover:bg-[#4a2114] text-stone-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-chocolate-950">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-caramel-600 animate-spin mx-auto" />
              <p className="font-medium text-stone-600 text-xs">
                Retrieving official invoice details...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-sm text-chocolate-950">
                  Unable to Display Invoice
                </h4>
                <p className="text-stone-600 text-xs max-w-sm mx-auto">
                  {error}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-chocolate-900 text-gold-300 font-bold text-xs hover:bg-chocolate-950 transition"
              >
                Back to Orders
              </button>
            </div>
          ) : invoice ? (
            <>
              {/* Meta & Shop Info */}
              <div className="p-4 rounded-2xl bg-white border border-cream-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-serif text-base font-bold text-chocolate-950 block">
                    {shop.name || 'ZORA SHOP'}
                  </span>
                  {shop.tagline && (
                    <span className="text-[11px] text-caramel-700 italic block">
                      "{shop.tagline}"
                    </span>
                  )}
                  {shop.address && (
                    <span className="text-[11px] text-stone-500 block">
                      {shop.address}
                    </span>
                  )}
                </div>
                <div className="sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-cream-200">
                  <div className="text-[11px] text-stone-500">
                    <strong>Invoice No:</strong> <span className="font-mono font-bold text-caramel-700">{invoiceNumber}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <strong>Order Ref:</strong> {orderNumber}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <strong>Date of Issue:</strong> {formatDate(invoice.issuedAt || invoice.createdAt)}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    <strong>Delivered:</strong> {formatDate(invoice.deliveryDate)}
                  </div>
                </div>
              </div>

              {/* Customer & Payment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer & Address */}
                <div className="p-4 rounded-2xl bg-white border border-cream-200 shadow-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-600 block">
                    Billed & Delivered To
                  </span>
                  <div className="font-bold text-chocolate-950 text-sm">
                    {customer.name || 'Valued Customer'}
                  </div>
                  <div className="text-stone-600 text-[11px]">
                    {customer.phone && <span>📞 {customer.phone}</span>}
                    {customer.phone && customer.email && <span className="mx-1">•</span>}
                    {customer.email && <span>✉️ {customer.email}</span>}
                  </div>
                  {address ? (
                    <div className="text-stone-700 text-[11px] leading-relaxed pt-1 border-t border-cream-200 mt-1">
                      {[address.house, address.street].filter(Boolean).join(', ')}
                      {address.landmark && <span className="block text-stone-500">Landmark: {address.landmark}</span>}
                      <span className="block">{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</span>
                      {address.instructions && (
                        <span className="block text-stone-500 italic mt-0.5">Note: {address.instructions}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-stone-500 text-[11px] italic pt-1">
                      Direct Store Delivery / Address on Record
                    </div>
                  )}
                </div>

                {/* Payment & Status */}
                <div className="p-4 rounded-2xl bg-white border border-cream-200 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-600 block">
                    Payment & Delivery
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Payment Method:</span>
                      <span className="font-bold text-chocolate-950">
                        {isCod ? 'Cash on Delivery (COD)' : paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-stone-500">Payment Status:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCod || paymentStatus.toLowerCase().includes('pending')
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cream-100/70 border border-cream-200 text-[10px] text-stone-600 leading-relaxed mt-2">
                    {isCod ? (
                      <span>
                        💵 <strong>Cash on Delivery:</strong> Please ensure the exact cash amount of <strong>₹{grandTotal}</strong> was handed to our delivery partner.
                      </span>
                    ) : (
                      <span>
                        ✅ <strong>Prepaid Order:</strong> Electronic payment recorded. Thank you for ordering with ZORA SHOP!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="rounded-2xl border border-cream-300 overflow-hidden shadow-xs">
                <div className="bg-[#f5ede6] px-4 py-2.5 border-b border-cream-300 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-chocolate-950">
                  <div className="col-span-6 sm:col-span-7">Item Description & Packaging</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-cream-200 bg-white">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 text-xs italic">
                      No individual items recorded in invoice snapshot.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2.5 grid grid-cols-12 items-center text-xs ${
                          idx % 2 === 1 ? 'bg-[#faf6f2]' : 'bg-white'
                        }`}
                      >
                        <div className="col-span-6 sm:col-span-7 pr-2">
                          <div className="font-bold text-chocolate-950">
                            {item.name || 'Artisanal Chocolate'}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {item.packageName || (item.packageType === 'pack250g' ? '250g Box' : 'Per Piece')}
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-stone-700">
                          ₹{Number(item.price || item.unitPrice || 0).toFixed(2)}
                        </div>
                        <div className="col-span-1 text-center font-medium text-stone-700">
                          {item.quantity || 1}
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right font-bold text-chocolate-950">
                          ₹{Number(item.total || ((item.price || item.unitPrice || 0) * (item.quantity || 1))).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 rounded-2xl bg-[#f5ede6] border border-cream-300 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount / Promo</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-caramel-400 flex justify-between items-center font-bold text-sm">
                  <span className="text-chocolate-950">Grand Total</span>
                  <span className="font-serif text-base text-caramel-800">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-cream-100 px-5 sm:px-6 py-3.5 border-t border-cream-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500">
            {invoice ? 'Official ZORA SHOP record' : ''}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-cream-300 bg-white hover:bg-cream-50 text-stone-700 font-bold text-xs transition shadow-xs"
            >
              Close
            </button>
            {invoice && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-4 py-2 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 font-bold text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                )}
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
