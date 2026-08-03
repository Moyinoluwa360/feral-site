import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import Account from './pages/Account'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Lookbook from './pages/Lookbook'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

const AppRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />

        {/* Auth */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

        {/* Protected */}
        <Route
          path="/checkout"
          element={
            <PageTransition>
              <ProtectedRoute><Checkout /></ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <PageTransition>
              <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/account"
          element={
            <PageTransition>
              <ProtectedRoute><Account /></ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/orders"
          element={
            <PageTransition>
              <ProtectedRoute><Orders /></ProtectedRoute>
            </PageTransition>
          }
        />

        <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <CustomCursor />
              <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
                <Navbar />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
