import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}) // { [productId]: qty }

  function addToCart(product, qty = 1) {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + qty,
    }))
  }

  function updateQty(id, qty) {
    if (qty <= 0) {
      setCart(prev => { const n = { ...prev }; delete n[id]; return n })
    } else {
      setCart(prev => ({ ...prev, [id]: qty }))
    }
  }

  function removeItem(id) {
    setCart(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function clearCart() {
    setCart({})
  }

  function cartCount() {
    return Object.values(cart).reduce((a, b) => a + b, 0)
  }

  function cartItems(products) {
    return Object.entries(cart)
      .map(([id, qty]) => ({ ...products.find(p => p.id === id), qty }))
      .filter(item => item.name)
  }

  function cartTotal(products) {
    return cartItems(products).reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, cartCount, cartItems, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
