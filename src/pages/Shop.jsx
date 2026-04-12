import { useState, useEffect, useMemo } from 'react'
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
  const [search, setSearch] = useState('')
  const [filterSurface, setFilterSurface] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const { addToCart, cart } = useCart()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) setError('No se pudieron cargar los productos.')
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
    showToast(`${prod.name} agregado al carrito`)
  }

  function setQty(id, val) {
    setQtys(prev => ({ ...prev, [id]: Math.max(1, val) }))
  }

  const surfaces = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return ['all', ...cats.sort()]
  }, [products])

  const brands = useMemo(() => {
    const brds = [...new Set(products.map(p => p.brand).filter(Boolean))]
    return ['all', ...brds.sort()]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchSurface = filterSurface === 'all' || p.category === filterSurface
      const matchBrand = filterBrand === 'all' || p.brand === filterBrand
      return matchSearch && matchSurface && matchBrand
    })
  }, [products, search, filterSurface, filterBrand])

  if (loading) return (
    <div style={{ ...t.page, ...t.center, flexDirection: 'column', gap: 16, minHeight: '100vh' }}>
      <div style={{ fontSize: 40 }}>🫧</div>
      <p style={{ color: '#9ca3af', fontSize: 15 }}>Cargando productos...</p>
    </div>
  )

  if (error) return (
    <div style={{ ...t.page, ...t.center, minHeight: '100vh' }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </div>
  )

  return (
    <div style={t.page}>
      <Header />
      
      <main style={t.main}>
        {/* Hero */}
        <div style={t.hero}>
          <h1 style={t.heroTitle}>Purely Clinical.</h1>
          <h2 style={t.heroSubtitle}>Ethereally Clean.</h2>
        </div>

        {/* Filters */}
        <div style={t.filterRow}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={t.filterLabel}>Search</label>
            <input
              style={t.searchInput}
              placeholder="Find your essential..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {surfaces.length > 1 && (
            <div style={{ minWidth: 180 }}>
              <label style={t.filterLabel}>Surface</label>
              <select
                style={t.select}
                value={filterSurface}
                onChange={e => setFilterSurface(e.target.value)}
              >
                <option value="all">All Surfaces</option>
                {surfaces.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {brands.length > 1 && (
            <div style={{ minWidth: 180 }}>
              <label style={t.filterLabel}>Brand</label>
              <select
                style={t.select}
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
              >
                <option value="all">All Brands</option>
                {brands.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 64, fontSize: 15 }}>
            No se encontraron productos.
          </p>
        ) : (
          <div style={t.grid}>
            {filtered.map(prod => {
              const qty = qtys[prod.id] || 1
              const inCart = cart[prod.id] || 0
              return (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  qty={qty}
                  inCart={inCart}
                  onQtyChange={(val) => setQty(prod.id, val)}
                  onAdd={() => handleAdd(prod)}
                />
              )
            })}
          </div>
        )}
      </main>

      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}

function ProductCard({ product, qty, inCart, onQtyChange, onAdd }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{
        ...t.card,
        ...(hover ? t.cardHover : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image */}
      <div style={{ ...t.cardImage, background: product.bg }}>
        {product.category && (
          <span style={t.cardBadge}>{product.category}</span>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '70%', height: '70%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 72 }}>{product.emoji}</span>
        )}
      </div>

      {/* Body */}
      <div style={t.cardBody}>
        {product.brand && <div style={t.cardTag}>{product.brand}</div>}
        <h3 style={t.cardTitle}>{product.name}</h3>
        <p style={t.cardDesc}>{product.description}</p>
        {product.unit && (
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{product.unit}</p>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={t.cardPrice}>${Number(product.price).toLocaleString('es-AR')}</span>
          {inCart > 0 && (
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginLeft: 'auto' }}>
              ✓ {inCart} en carrito
            </span>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>
            ⚠ Últimas {product.stock} unidades
          </p>
        )}

        {/* Footer */}
        <div style={t.cardFooter}>
          <div style={t.qtyControl}>
            <button style={t.qtyBtn} onClick={() => onQtyChange(qty - 1)}>−</button>
            <span style={t.qtyValue}>{qty}</span>
            <button style={t.qtyBtn} onClick={() => onQtyChange(qty + 1)}>+</button>
          </div>

          {product.stock > 0 ? (
            <button
              style={t.btnPrimary}
              onClick={onAdd}
              onMouseEnter={e => e.target.style.background = '#4a8fb0'}
              onMouseLeave={e => e.target.style.background = '#5ba3c9'}
            >
              Add to Cart
            </button>
          ) : (
            <button style={{ ...t.btnPrimary, background: '#d1d5db', cursor: 'not-allowed' }} disabled>
              Sin stock
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
