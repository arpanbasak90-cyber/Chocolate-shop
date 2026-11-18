/**
 * ZORA SHOP — Production API Client
 * Centralized HTTP communication with the backend server
 */

function resolveBaseUrl() {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env)
    ? import.meta.env.VITE_API_URL
    : (typeof process !== 'undefined' ? process.env?.VITE_API_URL : null);
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = resolveBaseUrl();

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('zora_auth_token') : null;

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

  // Customer Auth (Direct Login - No Email Verification Required)
  customerLogin: async ({ name, email, phone }) => {
    const data = await request('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone })
    });
    if (data?.token && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('zora_auth_token', data.token);
      window.localStorage.setItem('zora_auth_role', 'customer');
    }
    return data;
  },
  sendCustomerOtp: (params) => api.customerLogin(params),
  verifyCustomerOtp: (params) => api.customerLogin(params),
  getCustomerMe: () => request('/auth/customer/me'),
  customerLogout: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('zora_auth_token');
      window.localStorage.removeItem('zora_auth_role');
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
    if (data?.token && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('zora_auth_token', data.token);
      window.localStorage.setItem('zora_auth_role', 'shopkeeper');
    }
    return data;
  },
  getAdminMe: () => request('/auth/admin/me'),
  adminLogout: async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('zora_auth_token');
      window.localStorage.removeItem('zora_auth_role');
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

  // Invoices (Delivered Orders)
  getOrderInvoice: (orderId) => request(`/orders/${orderId}/invoice`),
  downloadOrderInvoicePdf: async (orderId, invoiceNumber = null) => {
    const cleanEndpoint = `/orders/${orderId}/invoice/pdf?download=1`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('zora_auth_token') : null;

    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
      method: 'GET',
      headers,
      credentials: 'include' // Always include HTTP-only session cookies
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMsg = errData.message || (
          response.status === 401
            ? 'Authentication required. Please sign in to download this invoice.'
            : response.status === 403
            ? 'Access denied: You do not have permission to download this invoice.'
            : response.status === 404
            ? 'Invoice not found. Invoices are generated automatically only after delivery.'
            : `Failed to download invoice (HTTP ${response.status})`
        );
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Received empty invoice PDF from server.');
      }

      // Resolve safe filename from Content-Disposition or fallback
      let filename = '';
      const disposition = response.headers.get('content-disposition');
      if (disposition) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
        if (match && match[1]) {
          // Extract only the basename (strip path separators & traversal components)
          let rawName = match[1].trim().replace(/^.*[\\\/]/, '').replace(/\.\.+/g, '');
          // Allow only safe filename characters
          let cleanName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
          // Ensure the final filename ends in .pdf and has a non-empty name before .pdf
          if (cleanName && cleanName !== '.pdf') {
            if (!cleanName.toLowerCase().endsWith('.pdf')) {
              cleanName = `${cleanName}.pdf`;
            }
            filename = cleanName;
          }
        }
      }

      if (!filename) {
        const safeNum = String(invoiceNumber || orderId).replace(/[^a-zA-Z0-9_-]/g, '_');
        filename = `ZORA-${safeNum}.pdf`;
      }

      // Safe browser download via Blob URL
      if (typeof window !== 'undefined') {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          try {
            window.URL.revokeObjectURL(blobUrl);
          } catch {
            // Ignore if already revoked
          }
        }, 1000);
      }

      return { success: true, filename };
    } catch (error) {
      console.error(`Error downloading PDF for order ${orderId}:`, error.message);
      throw error;
    }
  },

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
