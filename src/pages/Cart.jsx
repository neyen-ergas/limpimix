import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useCart } from '../CartContext'
import Header from '../components/Header'
import { t } from '../styles'
import { usePageTitle } from '../hooks/usePageTitle'

const WA_NUMBER = '5491131384773'

export default function Cart() {
  usePageTitle('Tu Carrito — H&L')
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null)
  const { cart, updateQty, removeItem, clearCart, cartItems, cartTotal, cartCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').eq('active', true)
    if (data) setProducts(data)
    setLoading(false)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function checkout() {
    const items = cartItems(products)
    if (!items.length) return

    setChecking(true)

    const payload = items.map(i => ({ id: i.id, qty: i.qty }))
    const { error } = await supabase.rpc('checkout_cart', { items: payload })

    if (error) {
      setChecking(false)
      showToast('Error al procesar el pedido: ' + error.message)
      return
    }

    const total = cartTotal(products)
    let msg = '🛒 *¡Hola! Me gustaría hacer el siguiente pedido:*\n\n'
    items.forEach(item => {
      msg += `• ${item.emoji || '•'} *${item.name}* (${item.unit}) x${item.qty} — $${(item.price * item.qty).toLocaleString('es-AR')}\n`
    })
    msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*`
    msg += '\n\nPor favor confirme disponibilidad y coordine la entrega. ¡Gracias! 😊'

    clearCart()
    setChecking(false)
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    navigate('/')
  }

  if (loading) return (
    <div style={{ ...t.page, ...t.center, minHeight: '100vh' }}>
      <p style={{ color: '#9ca3af' }}>Cargando...</p>
    </div>
  )

  const items = cartItems(products)
  const total = cartTotal(products)
  const subtotal = total
  const shipping = 4.99
  const tax = subtotal * 0.08

  return (
    <div style={t.page}>
      <Header />
      
      <div style={t.cartContainer}>
        <button
          style={{ ...t.btnGhost, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => navigate('/')}
        >
          <span>←</span> Continue Shopping
        </button>

        <h1 style={t.cartTitle}>Your Basket</h1>
        <p style={t.cartSubtitle}>
          {items.length} premium {items.length === 1 ? 'item' : 'items'} curated for an ethereal cleaning experience.
        </p>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Your basket is empty</p>
            <p style={{ fontSize: 14 }}>Return to the shop to add products</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
            {/* Items */}
            <div>
              {items.map(item => (
                <div key={item.id} style={t.cartItem}>
                  <div style={{ ...t.cartItemImage, background: item.bg }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                    ) : (
                      <span style={{ fontSize: 32 }}>{item.emoji}</span>
                    )}
                  </div>

                  <div style={t.cartItemInfo}>
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9ca3af', marginBottom: 4 }}>
                      {item.unit || item.category}
                    </p>
                    <p style={t.cartItemTitle}>{item.name}</p>
                    <p style={t.cartItemMeta}>{item.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      <div style={t.qtyControl}>
                        <button style={t.qtyBtn} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span style={t.qtyValue}>{item.qty}</span>
                        <button style={t.qtyBtn} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button style={t.removeBtn} onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={t.cartItemPrice}>${(item.price * item.qty).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={t.summary}>
              <h2 style={t.summaryTitle}>Order Summary</h2>

              <div style={t.summaryRow}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toLocaleString('es-AR')}</span>
              </div>

              <div style={t.summaryRow}>
                <span style={{ color: '#6b7280' }}>Standard Shipping</span>
                <span style={{ fontWeight: 600 }}>A coordinar</span>
              </div>

              <div style={t.summaryRow}>
                <span style={{ color: '#6b7280' }}>Tax (Calculated)</span>
                <span style={{ fontWeight: 600 }}>Incluido</span>
              </div>

              <div style={t.summaryTotal}>
                <span>Total</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={t.summaryTotalValue}>${total.toLocaleString('es-AR')}</span>
                <span style={t.ecoLabel}>Eco-Ship</span>
              </div>

              <button
                style={{
                  ...t.checkoutBtn,
                  ...(checking ? { background: '#9ca3af', cursor: 'not-allowed' } : {}),
                }}
                onClick={checkout}
                disabled={checking}
                onMouseEnter={e => !checking && (e.target.style.background = '#4a8fb0')}
                onMouseLeave={e => !checking && (e.target.style.background = '#5ba3c9')}
              >
                {checking ? 'Procesando...' : 'Checkout'}
              </button>

              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Secure encrypted transaction
              </p>
            </div>
          </div>
        )}
      </div>

      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}
