import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useCart } from '../CartContext'
import Header from '../components/Header'
import { t } from '../styles'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qtys, setQtys] = useState({})
  const [toast, setToast] = useState(null)
  const { addToCart, cart } = useCart()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) setError('No se pudieron cargar los productos. Intentá de nuevo.')
    else setProducts(data)
    setLoading(false)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleAdd(prod) {
    const qty = qtys[prod.id] || 1
    if (qty > prod.stock) { showToast('Sin suficiente stock'); return }
    addToCart(prod, qty)
    setQtys(prev => ({ ...prev, [prod.id]: 1 }))
    showToast(`${prod.emoji} ${prod.name} agregado al carrito`)
  }

  function setQty(id, val) {
    setQtys(prev => ({ ...prev, [id]: Math.max(1, val) }))
  }

  if (loading) return (
    <div style={{ ...t.page, ...t.center, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>🫧</div>
      <p style={{ color: '#64748b' }}>Cargando productos...</p>
    </div>
  )

  if (error) return (
    <div style={{ ...t.page, ...t.center }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </div>
  )

  return (
    <div style={t.page}>
      <Header />
      <main style={t.main}>
        <h1 style={t.pageTitle}>Nuestros Productos</h1>
        <p style={t.pageSub}>Elegí lo que necesitás y comprá directo por WhatsApp</p>

        {products.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 48 }}>
            No hay productos disponibles en este momento.
          </p>
        ) : (
          <div style={t.grid}>
            {products.map(prod => {
              const qty = qtys[prod.id] || 1
              const inCart = cart[prod.id] || 0
              return (
                <div key={prod.id} style={t.card}>
                  {/* Imagen / ícono */}
                  <div style={{
                    height: 120, background: prod.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
                    overflow: 'hidden',
                  }}>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      prod.emoji
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 16px 10px' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{prod.name}</p>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4, marginBottom: 6 }}>{prod.description}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{prod.unit}</p>
                    <p style={{ fontSize: 21, fontWeight: 700, color: prod.col }}>
                      ${Number(prod.price).toLocaleString('es-AR')}
                    </p>
                    {prod.stock <= 5 && prod.stock > 0 && (
                      <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 500, marginTop: 3 }}>
                        ⚠ Últimas {prod.stock} unidades
                      </p>
                    )}
                    {inCart > 0 && (
                      <p style={{ fontSize: 12, color: '#10b981', fontWeight: 500, marginTop: 3 }}>
                        ✓ {inCart} en carrito
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: '10px 16px 14px', borderTop: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    {/* Qty selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        style={{ width: 30, height: 30, border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '50%', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600 }}
                        onClick={() => setQty(prod.id, qty - 1)}
                      >−</button>
                      <span style={{ fontSize: 15, fontWeight: 600, minWidth: 22, textAlign: 'center' }}>{qty}</span>
                      <button
                        style={{ width: 30, height: 30, border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '50%', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600 }}
                        onClick={() => setQty(prod.id, qty + 1)}
                      >+</button>
                    </div>

                    {prod.stock > 0
                      ? <button style={{ background: '#10b981', border: 'none', color: '#fff', padding: '7px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleAdd(prod)}>
                          Agregar
                        </button>
                      : <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
                          Sin stock
                        </span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}
