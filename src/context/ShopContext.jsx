import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/products';

const ShopContext = createContext();

const SEED_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '9823456789',
    address: {
      house: 'Flat 402, Sunshine Heights',
      street: 'Near Jogger’s Park, Viman Nagar',
      landmark: 'Opposite Cafe Mocha',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411014',
      instructions: 'Please call before delivery'
    },
    registeredDate: '2026-10-15',
    ordersCount: 2
  },
  {
    id: 'cust-2',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@gmail.com',
    phone: '9823456788',
    address: {
      house: 'B-14, Green Glen Towers',
      street: 'Bellandur Main Road',
      landmark: 'Near EcoSpace Tech Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      instructions: 'Leave at reception'
    },
    registeredDate: '2026-11-01',
    ordersCount: 1
  },
  {
    id: 'cust-3',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@gmail.com',
    phone: '9765432198',
    address: {
      house: 'Flat 101, Nilgiri Villa',
      street: 'Law College Road, Erandwane',
      landmark: 'Behind Film Institute',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      instructions: 'Ring doorbell twice'
    },
    registeredDate: '2026-11-05',
    ordersCount: 1
  }
];

const DEFAULT_SETTINGS = {
  shopName: 'ZORA SHOP',
  tagline: 'Sweetness in Every Bite!',
  whatsappNumber: '+91 98980 14090',
  contactEmail: 'orders@zorashop.demo',
  shopAddress: 'Boutique Kitchen #14, Royal Palm Avenue, Pune, Maharashtra - 411001',
  deliveryFee: 40,
  freeDeliveryThreshold: 500,
  promoCode: 'ZORA10',
  promoDiscountPercent: 10
};

export const ShopProvider = ({ children }) => {
  // Session Role: 'customer' | 'shopkeeper' | null
  const [sessionRole, setSessionRole] = useState(() => {
    try {
      return localStorage.getItem('zora_session_role') || null;
    } catch {
      return null;
    }
  });

  // Current logged in customer
  const [currentCustomer, setCurrentCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_current_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Registered customers list
  const [registeredCustomers, setRegisteredCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_registered_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_CUSTOMERS;
    } catch {
      return SEED_CUSTOMERS;
    }
  });

  // Customer Login Events Counter (distinct from unique registered customers)
  const [customerLoginCount, setCustomerLoginCount] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_login_events_count');
      return saved ? Number(saved) : 14;
    } catch {
      return 14;
    }
  });

  // Admin / Shopkeeper logged in state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('zora_admin_logged') === 'true';
    } catch {
      return false;
    }
  });

  // Products catalog (automatically updates to full 52 products catalog and repairs image links)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) {
          return parsed.map((p) => {
            if (p.id === 'prod-almond' && (p.image?.includes('500e391a7657') || !p.image)) {
              return { ...p, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80' };
            }
            return p;
          });
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Shopping cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Orders list
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Active placed order ID
  const [activeOrderId, setActiveOrderId] = useState(() => {
    try {
      return localStorage.getItem('zora_active_order_id') || 'ZS-74921';
    } catch {
      return 'ZS-74921';
    }
  });

  // Store settings
  const [shopSettings, setShopSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('zora_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (sessionRole) {
        localStorage.setItem('zora_session_role', sessionRole);
      } else {
        localStorage.removeItem('zora_session_role');
      }
    } catch (e) {
      console.error(e);
    }
  }, [sessionRole]);

  useEffect(() => {
    try {
      if (currentCustomer) {
        localStorage.setItem('zora_current_customer', JSON.stringify(currentCustomer));
      } else {
        localStorage.removeItem('zora_current_customer');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_registered_customers', JSON.stringify(registeredCustomers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredCustomers]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_login_events_count', String(customerLoginCount));
    } catch (e) {
      console.error(e);
    }
  }, [customerLoginCount]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_admin_logged', isAdminLoggedIn ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (activeOrderId) localStorage.setItem('zora_active_order_id', activeOrderId);
    } catch (e) {
      console.error(e);
    }
  }, [activeOrderId]);

  useEffect(() => {
    try {
      localStorage.setItem('zora_settings', JSON.stringify(shopSettings));
    } catch (e) {
      console.error(e);
    }
  }, [shopSettings]);

  // Toast System
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Customer Authentication & Registration
  const customerLogin = ({ name, email, phone }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPhone = (phone || '').trim();

    // Check if customer already exists in registered list
    const existing = registeredCustomers.find(
      (c) => c.email.toLowerCase() === cleanEmail || c.phone === cleanPhone
    );

    let customerObj;
    if (existing) {
      customerObj = { ...existing, name: cleanName || existing.name };
    } else {
      customerObj = {
        id: `cust-${Date.now()}`,
        name: cleanName || 'Chocolate Lover',
        email: cleanEmail,
        phone: cleanPhone,
        address: {
          house: 'Flat 402, Sunshine Heights',
          street: 'Near Jogger’s Park, Viman Nagar',
          landmark: 'Opposite Cafe Mocha',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411014',
          instructions: 'Call upon arrival'
        },
        registeredDate: new Date().toISOString().split('T')[0],
        ordersCount: 0
      };
      setRegisteredCustomers((prev) => [customerObj, ...prev]);
    }

    setCurrentCustomer(customerObj);
    setSessionRole('customer');
    setCustomerLoginCount((count) => count + 1);
    addToast(`Welcome to ZORA SHOP, ${customerObj.name}! 🍫`);
    return customerObj;
  };

  const customerLogout = () => {
    setCurrentCustomer(null);
    setSessionRole(null);
    addToast('Logged out of customer session', 'info');
  };

  // 2. Shopkeeper Authentication
  const shopkeeperLogin = (email, password) => {
    if (email === 'admin@zorashop.demo' && password === 'demo123') {
      setIsAdminLoggedIn(true);
      setSessionRole('shopkeeper');
      addToast('Welcome back, Shopkeeper! 🏪');
      return true;
    }
    return false;
  };

  const shopkeeperLogout = () => {
    setIsAdminLoggedIn(false);
    setSessionRole(null);
    addToast('Logged out of Shopkeeper Dashboard', 'info');
  };

  // Switch Role / Back to First Screen
  const returnToRoleSelection = () => {
    setSessionRole(null);
  };

  // 3. Cart Actions
  const addToCart = (product, packageType = 'pack250g', quantity = 1) => {
    if (!product) return;
    const unitPrice = packageType === 'piece' ? product.piecePrice : product.boxPrice;
    const packageName = packageType === 'piece' ? 'Per Piece' : '250g Box';
    const cartItemId = `${product.id}-${packageType}`;

    setCart((prev) => {
      const safe = Array.isArray(prev) ? prev : [];
      const existing = safe.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return safe.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * unitPrice }
            : item
        );
      } else {
        return [
          ...safe,
          {
            cartItemId,
            id: product.id,
            name: product.name,
            packageType,
            packageName,
            unitPrice,
            quantity,
            total: unitPrice * quantity,
            image: product.image,
            category: product.category
          }
        ];
      }
    });

    addToast(`Added ${quantity}× ${product.name} (${packageName}) to your cart! 🍫`);
    setIsCartOpen(true);
  };

  const updateCartQty = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => (Array.isArray(prev) ? prev : []).filter((item) => item.cartItemId !== cartItemId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartSubtotal = safeCart.reduce((sum, item) => sum + (item?.total || 0), 0);
  const cartCount = safeCart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const deliveryFee = cartSubtotal >= (shopSettings?.freeDeliveryThreshold || 500) || cartSubtotal === 0 ? 0 : (shopSettings?.deliveryFee || 40);

  // 4. Order Actions
  const placeOrder = ({ customer, address, paymentMethod, discount = 0 }) => {
    const orderNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = `ZS-${orderNum}`;
    const calculatedDelivery = cartSubtotal >= (shopSettings?.freeDeliveryThreshold || 500) ? 0 : (shopSettings?.deliveryFee || 40);
    const grandTotal = Math.max(0, cartSubtotal + calculatedDelivery - discount);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: newOrderId,
      createdAt: now.toISOString(),
      customer,
      address,
      items: [...safeCart],
      subtotal: cartSubtotal,
      deliveryFee: calculatedDelivery,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'UPI' ? 'Paid (Simulated)' : 'Pending (Cash on Delivery)',
      orderStatus: 'Order Placed',
      timeline: [
        { status: 'Order Placed', time: timeStr, completed: true },
        { status: 'Order Confirmed', time: 'Pending', completed: false },
        { status: 'Preparing Your Chocolates', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false }
      ]
    };

    setOrders((prev) => [newOrder, ...(Array.isArray(prev) ? prev : [])]);
    setActiveOrderId(newOrderId);

    // Update customer orders count in registered customers
    setRegisteredCustomers((prev) =>
      prev.map((c) =>
        c.email.toLowerCase() === (customer.email || '').toLowerCase()
          ? { ...c, ordersCount: (c.ordersCount || 0) + 1, address }
          : c
      )
    );

    if (currentCustomer) {
      setCurrentCustomer((prev) => ({
        ...prev,
        ordersCount: (prev.ordersCount || 0) + 1,
        address
      }));
    }

    clearCart();
    addToast(`Order #${newOrderId} placed successfully! 🎉`, 'success');
    return newOrder;
  };

  // 5. Order Management Actions for Shopkeeper
  const updateOrderStatus = (orderId, newStatus) => {
    const statuses = [
      'Order Placed',
      'Order Confirmed',
      'Preparing Your Chocolates',
      'Out for Delivery',
      'Delivered',
      'Rejected'
    ];

    setOrders((prev) =>
      (Array.isArray(prev) ? prev : []).map((order) => {
        if (order.id !== orderId) return order;

        const currentIdx = statuses.indexOf(newStatus);
        const updatedTimeline = (order.timeline || []).map((step) => {
          const stepIdx = statuses.indexOf(step.status);
          const isCompleted = stepIdx <= currentIdx;
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          return {
            ...step,
            completed: isCompleted,
            time: isCompleted ? (step.time === 'Pending' ? timeStr : step.time) : 'Pending'
          };
        });

        return {
          ...order,
          orderStatus: newStatus,
          timeline: updatedTimeline,
          paymentStatus: newStatus === 'Delivered' && order.paymentMethod === 'COD' ? 'Paid (COD Collected)' : order.paymentStatus
        };
      })
    );

    addToast(`Order #${orderId} updated to "${newStatus}"!`, 'info');
  };

  // 6. Product Management Actions for Shopkeeper
  const addProduct = (newProduct) => {
    const id = `prod-${Date.now()}`;
    const slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = {
      ...newProduct,
      id,
      slug,
      rating: 5.0,
      reviewsCount: 1,
      isAvailable: true
    };
    setProducts((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
    addToast(`Added ${newProduct.name} to chocolate catalog! 🍫`);
  };

  const editProduct = (productId, updatedFields) => {
    setProducts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === productId ? { ...p, ...updatedFields } : p
      )
    );
    addToast('Chocolate details updated successfully!');
  };

  const removeProduct = (productId) => {
    setProducts((prev) => (Array.isArray(prev) ? prev : []).filter((p) => p.id !== productId));
    addToast('Product removed from catalog', 'warning');
  };

  const updateProductPrice = (productId, piecePrice, boxPrice) => {
    setProducts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === productId ? { ...p, piecePrice: Number(piecePrice), boxPrice: Number(boxPrice) } : p
      )
    );
    addToast('Prices updated!');
  };

  const toggleProductAvailability = (productId) => {
    setProducts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  // 7. Dynamic Revenue Calculation (derived ONLY from paid/completed orders!)
  const completedPaidOrders = (Array.isArray(orders) ? orders : []).filter(
    (o) =>
      o.orderStatus === 'Delivered' ||
      (o.paymentMethod === 'UPI' && o.paymentStatus.includes('Paid'))
  );

  const totalDemoRevenue = completedPaidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const avgOrderValue = completedPaidOrders.length > 0 ? Math.round(totalDemoRevenue / completedPaidOrders.length) : 0;

  // Reset to default demo data
  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setRegisteredCustomers(SEED_CUSTOMERS);
    setShopSettings(DEFAULT_SETTINGS);
    setCustomerLoginCount(14);
    localStorage.clear();
    addToast('Demo database restored to default products & orders!', 'info');
  };

  return (
    <ShopContext.Provider
      value={{
        sessionRole,
        setSessionRole,
        currentCustomer,
        customerLogin,
        customerLogout,
        registeredCustomers,
        customerLoginCount,
        isAdminLoggedIn,
        shopkeeperLogin,
        shopkeeperLogout,
        returnToRoleSelection,
        products: Array.isArray(products) ? products : INITIAL_PRODUCTS,
        cart: safeCart,
        orders: Array.isArray(orders) ? orders : INITIAL_ORDERS,
        activeOrderId,
        setActiveOrderId,
        shopSettings: shopSettings || DEFAULT_SETTINGS,
        setShopSettings,
        toasts,
        addToast,
        removeToast,
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
        placeOrder,
        updateOrderStatus,
        addProduct,
        editProduct,
        removeProduct,
        updateProductPrice,
        toggleProductAvailability,
        completedPaidOrders,
        totalDemoRevenue,
        avgOrderValue,
        resetDemoData
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
