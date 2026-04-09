import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './CartContext'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Tienda pública */}
          <Route path="/"      element={<Shop />} />
          <Route path="/cart"  element={<Cart />} />

          {/* Panel de administración — URL separada, invisible para clientes */}
          <Route path="/admin"           element={<AdminLogin />} />
          <Route path="/admin/panel"     element={<AdminPanel />} />

          {/* Cualquier ruta desconocida → tienda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
