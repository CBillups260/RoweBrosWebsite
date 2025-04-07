import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/main.css';
import './styles/original.css'; 
import './styles/hero.css'; // Import hero section styles
import './styles/announcement-bar.css'; // Import announcement bar styles
import './styles/header.css'; // Import header styles
import './styles/footer.css'; // Import footer styles
import './styles/rentals.css'; // Import rentals styles
import './styles/rental-detail.css'; // Import rental detail styles
import './styles/rentals-page.css'; // Import rentals page styles
import './styles/cart.css'; // Import cart styles
import './styles/placeholder-image.css'; // Import placeholder image styles
import './styles/why-choose.css'; // Import why choose section styles
import './styles/testimonials.css'; // Import testimonials styles
import './styles/auth.css'; // Import authentication styles
import './styles/checkout-modal.css'; // Import checkout modal styles
import './styles/checkout.css'; // Import checkout page styles
import './styles/contact-us.css'; // Import contact us styles
import './styles/dashboard.css'; // Import dashboard styles
import './styles/admin-dashboard.css'; // Import admin dashboard styles
import './styles/admin-login.css'; // Import admin login styles
import './styles/pages.css'; // Import internal pages styles
import './styles/faq.css'; // Import FAQ styles
import './styles/faq-page.css'; // Import FAQ page styles
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import HomePage from './components/home/HomePage';
import RentalsPage from './components/rentals/RentalsPage';
import RentalDetailPage from './components/rentals/RentalDetailPage';
import CartPage from './components/cart/CartPage';
import LoginPage from './components/auth/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';
import ContactPage from './components/pages/ContactPage';
import FaqPage from './components/pages/FaqPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Customer-facing routes */}
              <Route 
                path="/*" 
                element={
                  <>
                    <AnnouncementBar />
                    <Header />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/rentals" element={<RentalsPage />} />
                      <Route path="/rentals/:id" element={<RentalDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Footer />
                  </>
                } 
              />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
