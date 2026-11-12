/**
 * ZORA SHOP — Production API Client
 * Centralized HTTP communication with the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
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
      const errorMsg = data.message || `Request failed with status ${response.status}`;
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

  // Customer Auth (Dual OTP)
  sendCustomerOtp: ({ name, email, phone }) =>
    request('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone })
    }),
  verifyCustomerOtp: ({ name, email, phone, emailOtp, mobileOtp }) =>
    request('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, emailOtp, mobileOtp })
    }),
  getCustomerMe: () => request('/auth/customer/me'),
  customerLogout: () => request('/auth/customer/logout', { method: 'POST' }),

  // Admin Auth (Dual OTP)
  sendAdminOtp: ({ email }) =>
    request('/auth/admin/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  verifyAdminOtp: ({ email, emailOtp, mobileOtp }) =>
    request('/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, emailOtp, mobileOtp })
    }),
  getAdminMe: () => request('/auth/admin/me'),
  adminLogout: () => request('/auth/admin/logout', { method: 'POST' }),

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
