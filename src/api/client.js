/**
 * ZORA SHOP — Production API Client
 * Centralized HTTP communication with the backend server
 */

function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = resolveBaseUrl();

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('zora_auth_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' // Always include HTTP-only session cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || (
        response.status === 404
          ? `Endpoint not found (404) at ${url}. Verify the backend server is running on port 5000.`
          : `Request failed with status ${response.status}`
      );
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),

  // Customer Auth (Email OTP)
  sendCustomerOtp: ({ name, email, phone }) =>
    request('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone })
    }),
  verifyCustomerOtp: async ({ name, email, phone, emailOtp }) => {
    const data = await request('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, emailOtp })
    });
    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('zora_auth_token', data.token);
      localStorage.setItem('zora_auth_role', 'customer');
    }
    return data;
  },
  getCustomerMe: () => request('/auth/customer/me'),
  customerLogout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zora_auth_token');
      localStorage.removeItem('zora_auth_role');
    }
    return request('/auth/customer/logout', { method: 'POST' });
  },

  // Admin Auth (Email OTP)
  sendAdminOtp: ({ email }) =>
    request('/auth/admin/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  verifyAdminOtp: async ({ email, emailOtp }) => {
    const data = await request('/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, emailOtp })
    });
    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('zora_auth_token', data.token);
      localStorage.setItem('zora_auth_role', 'shopkeeper');
    }
    return data;
  },
  getAdminMe: () => request('/auth/admin/me'),
  adminLogout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zora_auth_token');
      localStorage.removeItem('zora_auth_role');
    }
    return request('/auth/admin/logout', { method: 'POST' });
  },

  // Cart & Pricing Verification
  verifyCart: ({ items, promoCode }) =>
    request('/cart/verify', {
      method: 'POST',
      body: JSON.stringify({ items, promoCode })
    }),

  // Orders
  createCheckoutOrder: ({ items, address, paymentMethod, promoCode, notes }) =>
    request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ items, address, paymentMethod, promoCode, notes })
    }),
  getMyOrders: () => request('/orders/my-orders'),
  trackOrder: (orderIdentifier) => request(`/orders/track/${orderIdentifier}`),

  // Razorpay Payments
  verifyRazorpayPayment: ({ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) =>
    request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature })
    }),

  // Admin Dashboard Management
  getAdminStats: () => request('/admin/stats'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderId, status, notes = '') =>
    request(`/orders/admin/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    }),
  getAdminCustomers: () => request('/admin/customers'),
  getAdminRevenue: () => request('/admin/revenue'),
  getStoreSettings: () => request('/admin/settings'),
  updateStoreSettings: (settings) =>
    request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Admin Product Catalog CRUD
  adminCreateProduct: (data) =>
    request('/products/admin', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  adminUpdateProduct: (id, data) =>
    request(`/products/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  adminToggleStock: (id) =>
    request(`/products/admin/${id}/toggle-stock`, {
      method: 'PATCH'
    }),
  adminDeleteProduct: (id) =>
    request(`/products/admin/${id}`, {
      method: 'DELETE'
    })
};
