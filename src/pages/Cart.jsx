import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useCart } from '../CartContext'
import Header from '../components/Header'
import { t } from '../styles'

const WA_NUMBER = '5491131384773'

export default function Cart() {
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

    // Descontar stock via función segura en Supabase
    const payload = items.map(i => ({ id: i.id, qty: i.qty }))
    const { error } = await supabase.rpc('checkout_cart', { items: payload })

    if (error) {
      setChecking(false)
      showToast('Error al procesar el pedido: ' + error.message)
      return
    }

    // Armar mensaje para WhatsApp
    const total = cartTotal(products)
    let msg = '🛒 *¡Hola! Me gustaría hacer el siguiente pedido:*\n\n'
    items.forEach(item => {
      msg += `• ${item.emoji} *${item.name}* (${item.unit}) x${item.qty} — $${(item.price * item.qty).toLocaleString('es-AR')}\n`
    })
    msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*`
    msg += '\n\nPor favor confirme disponibilidad y coordine la entrega. ¡Gracias! 😊'

    clearCart()
    setChecking(false)
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    navigate('/')
  }

  if (loading) return (
    <div style={{ ...t.page, ...t.center }}>
      <p style={{ color: '#64748b' }}>Cargando...</p>
    </div>
  )

  const items = cartItems(products)
  const total = cartTotal(products)

  return (
    <div style={t.page}>
      <Header products={products} />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px' }}>
        <button style={{ ...t.btnGhost, marginBottom: 20 }} onClick={() => navigate('/')}>
          ← Seguir comprando
        </button>

        <h1 style={t.pageTitle}>Tu Carrito</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
            <p style={{ fontSize: 16, marginBottom: 6 }}>El carrito está vacío</p>
            <p style={{ fontSize: 14 }}>Volvé a la tienda para agregar productos</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ ...t.card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Ícono */}
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {item.emoji}
                  </div>

                  {/* Info + qty */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{item.unit}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        style={{ width: 28, height: 28, border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => updateQty(item.id, item.qty - 1)}
                      >−</button>
                      <span style={{ fontSize: 15, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button
                        style={{ width: 28, height: 28, border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >+</button>
                    </div>
                  </div>

                  {/* Precio + eliminar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>${(item.price * item.qty).toLocaleString('es-AR')}</p>
                    <button
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                      onClick={() => removeItem(item.id)}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div style={{ ...t.card, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 15 }}>
                <span style={{ color: '#64748b' }}>Subtotal ({cartCount()} productos)</span>
                <span style={{ fontWeight: 600 }}>${total.toLocaleString('es-AR')}</span>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                El envío se coordina con el local
              </p>
              <button style={t.btnGreen} onClick={checkout} disabled={checking}>
                <span style={{ fontSize: 20 }}>📱</span>
                {checking ? 'Procesando...' : 'Comprar por WhatsApp'}
              </button>
            </div>
          </>
        )}
      </div>
      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}
