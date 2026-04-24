import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AccountOrderDetailPage } from './pages/AccountOrderDetailPage'
import { AccountOrdersPage } from './pages/AccountOrdersPage'
import { AccountProfilePage } from './pages/AccountProfilePage'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'
import { ProductsPage } from './pages/ProductsPage'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:skuId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<Navigate replace to="/account/profile" />} />
          <Route path="/account/profile" element={<AccountProfilePage />} />
          <Route path="/account/orders" element={<AccountOrdersPage />} />
          <Route path="/account/orders/:orderNo" element={<AccountOrderDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
