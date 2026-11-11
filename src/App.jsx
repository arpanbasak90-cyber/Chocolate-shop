import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import { FirstScreen } from './components/FirstScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { ToastContainer } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Helper to scroll window to top upon route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main App Router Controller based on sessionRole
function MainAppContent() {
  const { sessionRole, currentCustomer, isAdminLoggedIn } = useShop();

  // If visitor is logged in as Shopkeeper, render the Shopkeeper Admin Dashboard
  if (sessionRole === 'shopkeeper') {
    return <AdminDashboard />;
  }

  // If visitor is logged in as Customer, render the Customer Shopping Experience
  if (sessionRole === 'customer') {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-chocolate-950 font-sans selection:bg-caramel-500 selection:text-white">
        <Navbar />
        <CartDrawer />
        <ProductModal />
        <ToastContainer />

        <main className="flex-1">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/orders" element={<OrderTrackingPage />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<CustomerAccountPage />} />
            <Route path="/account" element={<CustomerAccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    );
  }

  // Default Initial Gateway: The First Screen with TWO Large Cards (Customer vs Shopkeeper)
  return (
    <>
      <ToastContainer />
      <FirstScreen />
    </>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <MainAppContent />
      </Router>
    </ShopProvider>
  );
}
