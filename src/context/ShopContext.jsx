import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { INITIAL_PRODUCTS } from '../data/products';

const ShopContext = createContext();

const DEFAULT_SETTINGS = {
  shopName: 'ZORA SHOP',
  tagline: 'Sweetness in Every Bite!',
  whatsappNumber: '+91 98980 14090',
  contactEmail: 'zorashop.homemade@gmail.com',
  shopAddress: 'Handcrafted Boutique Kitchen, Ahmedabad, Gujarat, India',
  standardDeliveryFee: 40,
  deliveryFeeThreshold: 500
};

export const ShopProvider = ({ children }) => {
  // Session Role: 'customer' | 'shopkeeper' | null
  const [sessionRole, setSessionRole] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Products Catalog (live from backend API)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Shopping Cart (persisted locally for instant reactivity, verified by server on checkout)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Store Settings (from server)
  const [shopSettings, setShopSettings] = useState(DEFAULT_SETTINGS);

  // Admin Data (populated when logged in as shopkeeper)
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  // Customer orders
  const [customerOrders, setCustomerOrders] = useState([]);

  // Toast notifications
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('zora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Fetch Live Products from Server
  const fetchProducts = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const res = await api.getProducts();
      if (res.success && Array.isArray(res.products) && res.products.length > 0) {
        setProducts(res.products);
      }
    } catch (err) {
      console.warn('Using initial products catalogue:', err.message);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Check Existing Sessions on App Mount
  useEffect(() => {
    async function initSessions() {
      setIsAuthChecking(true);
      fetchProducts();

      // Check Customer Session
      try {
        const custRes = await api.getCustomerMe();
        if (custRes.success && custRes.customer) {
          setCurrentCustomer(custRes.customer);
          setSessionRole('customer');
          setIsAuthChecking(false);
          return;
        }
      } catch (e) {}

      // Check Admin Session
      try {
        const adminRes = await api.getAdminMe();
        if (adminRes.success && adminRes.admin) {
          setAdminUser(adminRes.admin);
          setSessionRole('shopkeeper');
          setIsAuthChecking(false);
          return;
        }
      } catch (e) {}

      setIsAuthChecking(false);
    }

    initSessions();
  }, [fetchProducts]);

  // Fetch Admin Data when Shopkeeper logs in
  const refreshAdminData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, custsRes, settingsRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getStoreSettings()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setAdminStats(statsRes.value.stats);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        setAdminOrders(ordersRes.value.orders);
      }
      if (custsRes.status === 'fulfilled' && custsRes.value?.success) {
        setAdminCustomers(custsRes.value.customers);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value.settings) {
        setShopSettings(settingsRes.value.settings);
      }
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    }
  }, []);

  const saveStoreSettings = useCallback(async (newSettings) => {
    try {
      const res = await api.updateStoreSettings(newSettings);
      if (res.success && res.settings) {
        setShopSettings(res.settings);
        addToast('Store settings saved successfully!', 'success');
        return true;
      }
      return false;
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
      return false;
    }
  }, [addToast]);

  useEffect(() => {
    if (sessionRole === 'shopkeeper') {
      refreshAdminData();
    }
  }, [sessionRole, refreshAdminData]);

  // Fetch Customer Orders when Customer is active
  const refreshCustomerOrders = useCallback(async () => {
    if (!currentCustomer) return;
    try {
      const res = await api.getMyOrders();
      if (res.success) {
        setCustomerOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (sessionRole === 'customer') {
      refreshCustomerOrders();
    }
  }, [sessionRole, refreshCustomerOrders]);

  // ==========================================================================
  // REAL AUTHENTICATION ACTIONS (Dual OTP: Email + Mobile)
  // ==========================================================================

  // Customer: Request OTPs
  const sendCustomerOtp = async ({ name, email, phone }) => {
    try {
      const res = await api.sendCustomerOtp({ name, email, phone });
      addToast('Verification codes sent to your Email & Mobile number!', 'info');
      return res;
    } catch (err) {
      addToast(err.message, 'warning');
      throw err;
    }
  };

  // Customer: Verify both OTPs
  const verifyCustomerOtp = async ({ name, email, phone, emailOtp, mobileOtp }) => {
    try {
      const res = await api.verifyCustomerOtp({ name, email, phone, emailOtp, mobileOtp });
      if (res.success && res.customer) {
        setCurrentCustomer(res.customer);
        setSessionRole('customer');
        addToast(`Welcome ${res.customer.name}! Enjoy fresh handcrafted chocolates.`);
        return res.customer;
      }
    } catch (err) {
      addToast(err.message, 'warning');
      throw err;
    }
  };

  // Customer: Logout
  const customerLogout = async () => {
    try {
      await api.customerLogout();
    } catch (e) {}
    setCurrentCustomer(null);
    setSessionRole(null);
    addToast('Logged out successfully.');
  };

  // Customer: Update Profile & Address
  const updateCustomerProfile = useCallback((profileData) => {
    setCurrentCustomer((prev) => {
      const updated = {
        ...prev,
        ...profileData,
        address: profileData.address ? { ...prev?.address, ...profileData.address } : prev?.address
      };
      return updated;
    });
    addToast('Profile & delivery address updated successfully!', 'success');
  }, [addToast]);

  // Shopkeeper: Request OTPs
  const sendAdminOtp = async ({ email }) => {
    try {
      const res = await api.sendAdminOtp({ email });
      addToast('Owner verification codes dispatched to registered email & phone.', 'info');
      return res;
    } catch (err) {
      addToast(err.message, 'warning');
      throw err;
    }
  };

  // Shopkeeper: Verify both OTPs
  const verifyAdminOtp = async ({ email, emailOtp, mobileOtp }) => {
    try {
      const res = await api.verifyAdminOtp({ email, emailOtp, mobileOtp });
      if (res.success && res.admin) {
        setAdminUser(res.admin);
        setSessionRole('shopkeeper');
        addToast(`Owner access verified. Welcome, ${res.admin.name}!`);
        return res.admin;
      }
    } catch (err) {
      addToast(err.message, 'warning');
      throw err;
    }
  };

  // Shopkeeper: Logout
  const shopkeeperLogout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {}
    setAdminUser(null);
    setSessionRole(null);
    addToast('Owner session closed.');
  };

  const returnToRoleSelection = () => {
    setSessionRole(null);
  };

  // ==========================================================================
  // SHOPPING CART ACTIONS
  // ==========================================================================
  const addToCart = (product, packageType = 'pack250g', quantity = 1) => {
    const isPiece = packageType === 'piece';
    const unitPrice = isPiece ? product.piecePrice : product.boxPrice;
    const packageName = isPiece ? 'Per Piece' : '250g Box';
    const cartItemId = `${product.id}-${packageType}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          total: newQty * unitPrice
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            productId: product.id,
            id: product.id,
            name: product.name,
            packageType,
            packageName,
            price: unitPrice,
            quantity,
            total: unitPrice * quantity,
            image: product.image
          }
        ];
      }
    });

    addToast(`Added ${quantity}x ${product.name} (${packageName}) to your cart! 🍫`);
  };

  const updateCartQty = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, total: item.price * newQty }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derived cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cartSubtotal >= 500 || cartSubtotal === 0 ? 0 : 40;

  // ==========================================================================
  // ORDER CHECKOUT (Backend Recalculated)
  // ==========================================================================
  const placeOrder = async ({ address, paymentMethod = 'COD', promoCode = '', notes = '' }) => {
    if (!currentCustomer) {
      addToast('Please login with Email & Mobile OTP before checking out.', 'warning');
      throw new Error('Authentication required.');
    }

    try {
      const res = await api.createCheckoutOrder({
        items: cart,
        address,
        paymentMethod,
        promoCode,
        notes
      });

      if (res.success && res.order) {
        clearCart();
        setActiveOrderId(res.order.id);
        refreshCustomerOrders();
        return res;
      }
      throw new Error(res.message || 'Failed to place order.');
    } catch (err) {
      addToast(err.message, 'warning');
      throw err;
    }
  };

  // ==========================================================================
  // ADMIN ORDER & CATALOG MANAGEMENT
  // ==========================================================================
  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      const res = await api.updateOrderStatus(orderId, status, notes);
      if (res.success) {
        addToast(`Order ${res.order.orderNumber} status updated to "${status}"`);
        refreshAdminData();
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await api.adminCreateProduct(productData);
      if (res.success) {
        addToast('New chocolate variety created!');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  const editProduct = async (productId, updatedFields) => {
    try {
      const res = await api.adminUpdateProduct(productId, updatedFields);
      if (res.success) {
        addToast('Product updated successfully!');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  const removeProduct = async (productId) => {
    try {
      const res = await api.adminDeleteProduct(productId);
      if (res.success) {
        addToast('Product removed from catalog', 'info');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  const toggleProductAvailability = async (productId) => {
    try {
      const res = await api.adminToggleStock(productId);
      if (res.success) {
        addToast(res.message, 'info');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  const updateProductPrice = async (productId, piecePrice, boxPrice) => {
    return editProduct(productId, { piecePrice: Number(piecePrice), boxPrice: Number(boxPrice) });
  };

  return (
    <ShopContext.Provider
      value={{
        sessionRole,
        setSessionRole,
        currentCustomer,
        isAdminLoggedIn: !!adminUser,
        adminUser,
        isAuthChecking,

        // Customer Dual-OTP Auth
        sendCustomerOtp,
        verifyCustomerOtp,
        customerLogout,
        updateCustomerProfile,

        // Shopkeeper Dual-OTP Auth
        sendAdminOtp,
        verifyAdminOtp,
        shopkeeperLogout,
        returnToRoleSelection,

        // Products Catalog
        products,
        isProductsLoading,
        fetchProducts,

        // Cart
        cart,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        deliveryFee,

        // Orders
        orders: sessionRole === 'shopkeeper' ? adminOrders : customerOrders,
        activeOrderId,
        setActiveOrderId,
        placeOrder,
        refreshCustomerOrders,

        // Store Settings & Toasts
        shopSettings,
        setShopSettings,
        saveStoreSettings,
        toasts,
        addToast,
        removeToast,

        // Admin Management
        adminStats,
        adminOrders,
        adminCustomers,
        refreshAdminData,
        updateOrderStatus,
        addProduct,
        editProduct,
        removeProduct,
        updateProductPrice,
        toggleProductAvailability
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
