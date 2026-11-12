import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Store,
  LayoutDashboard,
  Package,
  Users,
  Edit2,
  DollarSign,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Check,
  AlertTriangle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  X,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const AdminDashboard = () => {
  const {
    orders,
    products,
    adminCustomers,
    adminStats,
    refreshAdminData,
    shopkeeperLogout,
    updateOrderStatus,
    addProduct,
    editProduct,
    removeProduct,
    updateProductPrice,
    toggleProductAvailability,
    shopSettings,
    setShopSettings,
    saveStoreSettings,
    addToast
  } = useShop();

  // Active Tab in Sidebar: 'dashboard', 'orders', 'customers', 'products', 'revenue', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search & Filters in Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Nutty Delights',
    piecePrice: 12,
    boxPrice: 600,
    approxPiecesPer250g: '20-24 pcs',
    shortDescription: '',
    fullDescription: '',
    badge: 'Fresh Batch',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'
  });

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState(null);

  // WhatsApp Preview Modal for any order
  const [whatsappOrderPreview, setWhatsappOrderPreview] = useState(null);

  // Stats from live backend
  const totalOrders = adminStats?.totalOrders ?? (orders || []).length;
  const pendingOrders = adminStats?.pendingOrders ?? 0;
  const completedOrders = adminStats?.deliveredOrders ?? 0;
  const totalRevenue = adminStats?.totalRevenue ?? 0;
  const totalCustomers = adminStats?.totalCustomers ?? (adminCustomers || []).length;
  const confirmedOrders = adminStats?.confirmedOrders ?? 0;

  // Filtered orders
  const filteredOrders = (orders || []).filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      (o.orderNumber || o.id || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer?.phone || '').includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  // Filtered paid orders strictly for Revenue Analytics
  const completedPaidOrders = (orders || []).filter(
    (o) => o.paymentStatus === 'Paid' || (o.paymentMethod === 'Cash on Delivery' && o.orderStatus === 'Delivered')
  );
  const totalPaidRevenue = adminStats?.totalRevenue ?? completedPaidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const avgOrderValue = completedPaidOrders.length > 0 ? Math.round(totalPaidRevenue / completedPaidOrders.length) : 0;

  // Handle Add Product Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.shortDescription) {
      addToast('Please enter chocolate name and description', 'warning');
      return;
    }
    addProduct(newProd);
    setIsAddModalOpen(false);
    setNewProd({
      name: '',
      category: 'Nutty Delights',
      piecePrice: 12,
      boxPrice: 600,
      approxPiecesPer250g: '20-24 pcs',
      shortDescription: '',
      fullDescription: '',
      badge: 'Fresh Batch',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'
    });
  };

  // Handle Edit Product Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    editProduct(editingProduct.id, {
      name: editingProduct.name,
      piecePrice: Number(editingProduct.piecePrice),
      boxPrice: Number(editingProduct.boxPrice),
      shortDescription: editingProduct.shortDescription,
      category: editingProduct.category
    });
    setEditingProduct(null);
  };

  // Format WhatsApp Notification Message
  const getWhatsAppMessage = (order) => {
    if (!order) return '';
    const itemsText = (order.items || [])
      .map((it) => `• ${it.quantity}x ${it.name} (${it.packageName}) - ₹${it.total}`)
      .join('\n');

    return `*🍫 ZORA SHOP - ORDER NOTIFICATION*
*Order ID:* #${order.id}
*Customer Name:* ${order.customer?.name || 'Customer'}
*Phone Number:* ${order.customer?.phone || 'N/A'}
*Delivery Address:* ${order.address?.house || ''}, ${order.address?.street || ''}, ${order.address?.city || ''} - ${order.address?.pincode || ''}

*Ordered Chocolates:*
${itemsText}

*Subtotal:* ₹${order.subtotal}
*Delivery Fee:* ₹${order.deliveryFee}
*Total Amount:* ₹${order.grandTotal}
*Payment Method:* ${order.paymentMethod} (${order.paymentStatus})
*Current Status:* ${order.orderStatus}

_Crafted fresh with pure cocoa at Zora Shop! Sweetness in Every Bite!_`;
  };

  const openWhatsAppDispatcher = (order) => {
    const text = getWhatsAppMessage(order);
    const cleanPhone = (shopSettings.whatsappNumber || '').replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1c0c07] text-cream-100 flex flex-col md:flex-row font-sans">
      
      {/* ══════════════════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION (Chocolate Themed)
      ══════════════════════════════════════════════════════════════════════════ */}
      <aside className="w-full md:w-64 bg-[#2b130a] border-r border-[#421d10] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo & Shopkeeper identity */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#421d10]">
            <div className="w-11 h-11 rounded-2xl bg-[#3c1b11] border border-gold-500/40 text-gold-400 flex items-center justify-center text-2xl shadow-md">
              🏪
            </div>
            <div>
              <div className="font-serif text-lg font-extrabold text-white">
                ZORA SHOP
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-caramel-300">
                Shopkeeper Console
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'orders', label: `All Orders (${orders.length})`, icon: Package },
              { id: 'customers', label: `Customers (${(adminCustomers || []).length})`, icon: Users },
              { id: 'products', label: `Products (${products.length})`, icon: Edit2 },
              { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
              { id: 'settings', label: 'Store Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-caramel-600 to-caramel-700 text-white font-bold shadow-md'
                      : 'text-stone-300 hover:bg-[#3c1b11] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-gold-300" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Actions */}
        <div className="pt-6 border-t border-[#421d10] space-y-3">
          <button
            onClick={refreshAdminData}
            className="w-full py-2.5 px-3 rounded-xl bg-[#3c1b11] hover:bg-[#4a2114] text-gold-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            title="Refresh live orders, customer records, and revenue metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Store Data</span>
          </button>

          <button
            onClick={shopkeeperLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-red-900 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Owner Session</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-screen">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-caramel-400">
                Operations & Performance
              </div>
              <h1 className="font-serif text-3xl font-bold text-white mt-1">
                Shopkeeper Dashboard Overview
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Real database analytics: customer registrations, live order pipeline, and collected revenue.
              </p>
            </div>

            {/* 6 KEY STATISTICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              
              {/* Stat 1: Registered Customers */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Registered Customers
                </span>
                <div className="font-serif text-2xl font-bold text-white">
                  {totalCustomers}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold block">Unique Accounts</span>
              </div>

              {/* Stat 2: Confirmed Orders */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-caramel-400 uppercase tracking-wider">
                  Confirmed Orders
                </span>
                <div className="font-serif text-2xl font-bold text-caramel-300">
                  {confirmedOrders}
                </div>
                <span className="text-[10px] text-stone-400 font-semibold block">Verified Orders</span>
              </div>

              {/* Stat 3: Total Orders */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="font-serif text-2xl font-bold text-white">
                  {totalOrders}
                </div>
                <span className="text-[10px] text-stone-400 font-semibold block">Database Records</span>
              </div>

              {/* Stat 4: Pending Orders */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Pending Orders
                </span>
                <div className="font-serif text-2xl font-bold text-amber-300">
                  {pendingOrders}
                </div>
                <span className="text-[10px] text-amber-500 font-semibold block">Needs Kitchen Prep</span>
              </div>

              {/* Stat 5: Completed Orders */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Delivered Orders
                </span>
                <div className="font-serif text-2xl font-bold text-emerald-300">
                  {completedOrders}
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold block">Delivered Fresh</span>
              </div>

              {/* Stat 6: Total Collected Revenue */}
              <div className="bg-[#2b130a] rounded-2xl p-4 border border-[#421d10] space-y-1">
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                  Collected Revenue
                </span>
                <div className="font-serif text-2xl font-bold text-gold-300">
                  ₹{totalRevenue}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold block">Paid & Completed Only</span>
              </div>

            </div>

            {/* Recent Orders Overview */}
            <div className="bg-[#2b130a] rounded-3xl p-6 sm:p-7 border border-[#421d10] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#421d10]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-stone-400">
                    Latest batches ordered through the customer shopping portal.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-gold-400 hover:underline font-bold"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#421d10] text-stone-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Products</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#35180d]">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#35180d]/60">
                        <td className="py-3 font-mono font-bold text-gold-300">
                          #{ord.id}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-white">{ord.customer?.name}</div>
                          <div className="text-[11px] text-stone-400">{ord.customer?.phone}</div>
                        </td>
                        <td className="py-3 text-stone-300 max-w-xs truncate">
                          {(ord.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 font-bold text-white">
                          ₹{ord.grandTotal}
                        </td>
                        <td className="py-3 text-stone-300">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#3c1b11] text-gold-300 border border-gold-500/30">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-[#3c1b11] hover:bg-[#4a2114] text-gold-300"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT (Section 11 Requirement) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#421d10] gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Order Management
                </h2>
                <p className="text-xs text-stone-400">
                  Inspect customer orders, confirm or reject, and update fulfillment status in real-time.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by ID, name or phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#2b130a] border border-[#421d10] text-xs text-white placeholder-stone-500 focus:outline-none focus:border-caramel-500"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Order Placed', 'Order Confirmed', 'Preparing Your Chocolates', 'Out for Delivery', 'Delivered', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    orderStatusFilter === st
                      ? 'bg-gradient-to-r from-caramel-600 to-caramel-700 text-white font-bold shadow-md'
                      : 'bg-[#2b130a] text-stone-300 hover:bg-[#3c1b11]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-[#2b130a] rounded-3xl p-6 border border-[#421d10] shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#421d10] text-stone-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Order ID & Date</th>
                    <th className="pb-3">Customer & Contact</th>
                    <th className="pb-3">Complete Delivery Address</th>
                    <th className="pb-3">Ordered Chocolates</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Update Order Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35180d]">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#35180d]/60">
                      <td className="py-3.5 align-top">
                        <div className="font-mono font-bold text-gold-300 text-sm">
                          #{ord.id}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 align-top">
                        <div className="font-bold text-white">{ord.customer?.name}</div>
                        <div className="text-stone-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-caramel-400" />
                          <span>{ord.customer?.phone}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 truncate max-w-[140px]">
                          {ord.customer?.email}
                        </div>
                      </td>

                      <td className="py-3.5 align-top max-w-xs">
                        <div className="text-stone-300 leading-snug">
                          {ord.address?.house}, {ord.address?.street}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {ord.address?.city} - {ord.address?.pincode}
                        </div>
                      </td>

                      <td className="py-3.5 align-top">
                        <div className="space-y-1">
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx} className="text-[11px] text-stone-300">
                              <strong>{it.quantity}x</strong> {it.name}{' '}
                              <span className="text-caramel-400">({it.packageName})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 align-top">
                        <div className="font-bold text-white text-sm">
                          ₹{ord.grandTotal}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {ord.paymentMethod} • <span className="text-gold-300">{ord.paymentStatus}</span>
                        </div>
                      </td>

                      <td className="py-3.5 align-top">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                          className="text-xs font-semibold bg-[#1c0c07] border border-[#421d10] rounded-xl px-2.5 py-1.5 text-gold-300 focus:outline-none focus:border-caramel-500"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Order Confirmed">Order Confirmed</option>
                          <option value="Preparing Your Chocolates">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3.5 align-top text-right space-x-1">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg bg-[#3c1b11] hover:bg-[#4a2114] text-gold-300"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setWhatsappOrderPreview(ord)}
                          className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-300"
                          title="Preview WhatsApp Message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMERS MANAGEMENT (Section 10 Requirement) */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="pb-3 border-b border-[#421d10]">
              <div className="text-xs font-bold uppercase tracking-wider text-caramel-400">
                Customer Directory
              </div>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">
                Registered Customers & Login Activity
              </h2>
              <p className="text-xs text-stone-400">
                Track unique registered accounts alongside cumulative customer login events.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#2b130a] p-5 rounded-2xl border border-[#421d10] flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400 font-bold uppercase">Total Unique Registered Customers</div>
                  <div className="font-serif text-3xl font-bold text-white mt-1">{totalCustomers}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#3c1b11] text-gold-400 flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>

              <div className="bg-[#2b130a] p-5 rounded-2xl border border-[#421d10] flex items-center justify-between">
                <div>
                  <div className="text-xs text-caramel-400 font-bold uppercase">Total Verified Orders</div>
                  <div className="font-serif text-3xl font-bold text-caramel-300 mt-1">{totalOrders}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#3c1b11] text-caramel-400 flex items-center justify-center text-2xl">
                  📦
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-[#2b130a] rounded-3xl p-6 border border-[#421d10] shadow-xl overflow-x-auto">
              {(adminCustomers || []).length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs space-y-2">
                  <div className="text-3xl">👥</div>
                  <p className="font-semibold text-white">No Registered Customer Accounts Yet</p>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    When customers register via Email OTP and place chocolate orders, their verified profiles appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#421d10] text-stone-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-3">Customer Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Mobile Number</th>
                      <th className="pb-3">Registration Date</th>
                      <th className="pb-3">Orders Placed</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#35180d]">
                    {adminCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#35180d]/60">
                        <td className="py-3.5 font-bold text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#3c1b11] text-gold-400 text-xs flex items-center justify-center font-bold">
                            {(cust.name || 'C').charAt(0)}
                          </span>
                          <span>{cust.name}</span>
                        </td>
                        <td className="py-3.5 text-stone-300">{cust.email}</td>
                        <td className="py-3.5 text-stone-300">{cust.phone}</td>
                        <td className="py-3.5 text-stone-400">
                          {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="py-3.5 font-bold text-gold-300">{cust.ordersCount || 0} orders</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: PRODUCTS MANAGEMENT (Section 12 Requirement) */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#421d10] gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Chocolate Product Management
                </h2>
                <p className="text-xs text-stone-400">
                  Update product names, adjust piece and 250g prices, change descriptions, or add new chocolates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Chocolate</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#2b130a] rounded-3xl p-5 border border-[#421d10] shadow-md flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1c0c07] mb-3">
                      <img
                        src={prod.image || '/chocolate-placeholder.svg'}
                        alt={prod.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/chocolate-placeholder.svg';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => toggleProductAvailability(prod.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                            prod.isAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {prod.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold uppercase text-caramel-400">
                      {prod.category}
                    </div>
                    <h3 className="font-serif text-base font-bold text-white mt-0.5">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                      {prod.shortDescription}
                    </p>
                  </div>

                  {/* Pricing & Edit Actions */}
                  <div className="pt-3 border-t border-[#421d10] flex items-center justify-between text-xs">
                    <div>
                      <div>Per Piece: <strong className="text-white font-bold">₹{prod.piecePrice}</strong></div>
                      <div>250g Box: <strong className="text-caramel-300 font-bold">₹{prod.boxPrice}</strong></div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prod)}
                        className="px-3 py-1.5 rounded-xl bg-[#3c1b11] hover:bg-[#4a2114] text-gold-300 font-bold text-[11px] transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(prod.id)}
                        className="p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-[11px] transition"
                        title="Delete Chocolate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: REVENUE ANALYTICS (Section 13 Requirement) */}
        {activeTab === 'revenue' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="pb-3 border-b border-[#421d10]">
              <div className="text-xs font-bold uppercase tracking-wider text-caramel-400">
                Financial Performance (Production Ledger)
              </div>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">
                Revenue & Sales Analytics
              </h2>
              <p className="text-xs text-stone-400">
                Calculated strictly from completed and verified customer transactions (Paid online + Delivered COD).
              </p>
            </div>

            {/* Revenue Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#2b130a] p-6 rounded-3xl border border-[#421d10] space-y-1">
                <span className="text-xs text-stone-400 uppercase font-bold">Total Collected Revenue</span>
                <div className="font-serif text-3xl font-bold text-gold-300">₹{totalPaidRevenue}</div>
                <p className="text-[11px] text-emerald-400 font-medium">Excludes pending / unfulfilled COD orders</p>
              </div>

              <div className="bg-[#2b130a] p-6 rounded-3xl border border-[#421d10] space-y-1">
                <span className="text-xs text-stone-400 uppercase font-bold">Paid Orders Fulfilled</span>
                <div className="font-serif text-3xl font-bold text-white">{completedPaidOrders.length}</div>
                <p className="text-[11px] text-stone-400">Verified Razorpay UPI / Card or Delivered COD</p>
              </div>

              <div className="bg-[#2b130a] p-6 rounded-3xl border border-[#421d10] space-y-1">
                <span className="text-xs text-stone-400 uppercase font-bold">Average Order Value</span>
                <div className="font-serif text-3xl font-bold text-caramel-300">₹{avgOrderValue}</div>
                <p className="text-[11px] text-stone-400">Per paying customer basket</p>
              </div>
            </div>

            {/* Sales Breakdown by Payment Type */}
            <div className="bg-[#2b130a] p-6 sm:p-8 rounded-3xl border border-[#421d10] space-y-4">
              <h3 className="font-serif text-lg font-bold text-white">
                Completed Sales Transactions (Paid & Verified)
              </h3>
              <div className="overflow-x-auto">
                {completedPaidOrders.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No verified completed transactions recorded in database yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#421d10] text-stone-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Payment Method</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#35180d]">
                      {completedPaidOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#35180d]/60">
                          <td className="py-3 font-mono font-bold text-gold-300">#{ord.id}</td>
                          <td className="py-3 font-medium text-white">{ord.customer?.name}</td>
                          <td className="py-3 text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-stone-300">{ord.paymentMethod}</td>
                          <td className="py-3 font-bold text-white">₹{ord.grandTotal}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: SETTINGS (Section 14 Requirement) */}
        {activeTab === 'settings' && (
          <div className="max-w-xl bg-[#2b130a] p-6 sm:p-8 rounded-3xl border border-[#421d10] space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Store Settings & WhatsApp Dispatch
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Configure your store WhatsApp number for direct customer orders and notifications.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">
                  Shopkeeper WhatsApp Number *
                </label>
                <input
                  type="text"
                  value={shopSettings.whatsappNumber}
                  onChange={(e) => setShopSettings({ ...shopSettings, whatsappNumber: e.target.value })}
                  placeholder="+91 6289760577"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white font-mono focus:outline-none focus:border-caramel-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  * Configurable as requested. Customer order notifications will target this number.
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">
                  Shop Kitchen Physical Address
                </label>
                <input
                  type="text"
                  value={shopSettings.shopAddress}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={shopSettings.deliveryFee}
                    onChange={(e) => setShopSettings({ ...shopSettings, deliveryFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">
                    Free Delivery Over (₹)
                  </label>
                  <input
                    type="number"
                    value={shopSettings.freeDeliveryThreshold}
                    onChange={(e) => setShopSettings({ ...shopSettings, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white focus:outline-none focus:border-caramel-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await saveStoreSettings(shopSettings);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs shadow-md transition"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: VIEW FULL ORDER DETAILS
      ══════════════════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#2b130a] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#421d10] shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-xs text-cream-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#421d10]">
              <div>
                <span className="text-[10px] font-bold text-caramel-400 uppercase tracking-wider">
                  Order Inspection
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#1c0c07] space-y-1">
                <h4 className="font-bold text-gold-300">Customer Details</h4>
                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1c0c07] space-y-1">
                <h4 className="font-bold text-gold-300">Delivery Address</h4>
                <p>{selectedOrder.address?.house}, {selectedOrder.address?.street}</p>
                <p>{selectedOrder.address?.city} - {selectedOrder.address?.pincode}</p>
                {selectedOrder.address?.instructions && (
                  <p className="text-[11px] text-stone-400 italic">"{selectedOrder.address.instructions}"</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gold-300 uppercase mb-2">Chocolates in Basket</h4>
              <div className="space-y-1.5">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#1c0c07]">
                    <div className="flex items-center gap-2">
                      <img
                        src={it.image || '/chocolate-placeholder.svg'}
                        alt={it.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/chocolate-placeholder.svg';
                        }}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span>{it.quantity}x {it.name} ({it.packageName})</span>
                    </div>
                    <span className="font-bold text-white">₹{it.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#421d10]">
              <div>
                <span>Status: </span>
                <strong className="text-gold-300">{selectedOrder.orderStatus}</strong>
              </div>
              <div className="text-right">
                <span className="text-stone-400">Total: </span>
                <span className="font-serif text-lg font-bold text-caramel-300">₹{selectedOrder.grandTotal}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => openWhatsAppDispatcher(selectedOrder)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#3c1b11] text-stone-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: WHATSAPP ORDER PREVIEW (Section 14 Requirement)
      ══════════════════════════════════════════════════════════════════════════ */}
      {whatsappOrderPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#2b130a] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-emerald-700/60 shadow-2xl space-y-4 text-xs text-cream-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#421d10]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif text-lg font-bold text-white">
                  WhatsApp Order Message Preview
                </h3>
              </div>
              <button
                onClick={() => setWhatsappOrderPreview(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#1c0c07] p-4 rounded-2xl border border-emerald-900 font-mono text-emerald-200 whitespace-pre-wrap leading-relaxed shadow-inner">
              {getWhatsAppMessage(whatsappOrderPreview)}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-400">
                To: {shopSettings.whatsappNumber}
              </span>
              <button
                onClick={() => {
                  openWhatsAppDispatcher(whatsappOrderPreview);
                  setWhatsappOrderPreview(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Send to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: ADD NEW PRODUCT
      ══════════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#2b130a] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#421d10] shadow-2xl space-y-4 text-xs text-cream-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#421d10]">
              <h3 className="font-serif text-lg font-bold text-white">
                Add New Chocolate Product
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">Chocolate Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Pistachio Silk Crunch"
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">Price Per Piece (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.piecePrice}
                    onChange={(e) => setNewProd({ ...newProd, piecePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">Price 250g Box (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.boxPrice}
                    onChange={(e) => setNewProd({ ...newProd, boxPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newProd.shortDescription}
                  onChange={(e) => setNewProd({ ...newProd, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#3c1b11] text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 text-white font-bold"
                >
                  Save Chocolate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: EDIT EXISTING PRODUCT
      ══════════════════════════════════════════════════════════════════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#2b130a] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#421d10] shadow-2xl space-y-4 text-xs text-cream-100">
            <div className="flex items-center justify-between pb-2 border-b border-[#421d10]">
              <h3 className="font-serif text-lg font-bold text-white">
                Edit Chocolate Details
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">Price Per Piece (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.piecePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, piecePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 uppercase mb-1">Price 250g Box (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.boxPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, boxPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDescription}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c0c07] border border-[#421d10] text-xs text-white resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-[#3c1b11] text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 text-white font-bold"
                >
                  Update Chocolate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
