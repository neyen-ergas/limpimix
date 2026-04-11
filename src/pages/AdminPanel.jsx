import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { t, EMOJIS, PALETTE } from '../styles'

const TABS = ['Productos', 'Dashboard']

export default function AdminPanel() {
  const [tab, setTab] = useState('Productos')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [editProd, setEditProd] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newProd, setNewProd] = useState({ name: '', description: '', price: '', stock: '', unit: '', emoji: '🧴', image: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/admin', { replace: true }); return }
      setSession(data.session)
      fetchAll()
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') navigate('/admin', { replace: true })
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ])
    if (prods) setProducts(prods)
    if (ords) setOrders(ords)
    setLoading(false)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function uploadImage(file) {
    if (!file) return null
    try {
      setUploading(true)
      if (import.meta.env.MODE === 'development') {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => { showToast('✓ Imagen cargada (modo local)'); resolve(e.target.result) }
          reader.readAsDataURL(file)
        })
      }
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('product-images').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (err) {
      showToast('Error al subir imagen: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleLogout() { await supabase.auth.signOut() }

  async function handleAdd() {
    if (!newProd.name || !newProd.price) { showToast('Nombre y precio son obligatorios'); return }
    setSaving(true)
    const c = PALETTE[products.length % PALETTE.length]
    let imageUrl = newProd.image
    if (newProd.imageFile) {
      imageUrl = await uploadImage(newProd.imageFile)
      if (!imageUrl) { setSaving(false); return }
    }
    const { error } = await supabase.from('products').insert({
      name: newProd.name, description: newProd.description,
      price: Number(newProd.price), stock: Number(newProd.stock) || 0,
      unit: newProd.unit, emoji: newProd.emoji, image: imageUrl,
      bg: c.bg, col: c.col, category: newProd.category || null,
    })
    if (error) showToast('Error al agregar: ' + error.message)
    else {
      setNewProd({ name: '', description: '', price: '', stock: '', unit: '', emoji: '🧴', image: '', category: '' })
      setShowAdd(false)
      showToast('Producto agregado ✓')
      fetchAll()
    }
    setSaving(false)
  }

  async function handleSaveEdit() {
    if (!editProd.name || !editProd.price) { showToast('Nombre y precio son obligatorios'); return }
    setSaving(true)
    let imageUrl = editProd.image
    if (editProd.imageFile) {
      imageUrl = await uploadImage(editProd.imageFile)
      if (!imageUrl) { setSaving(false); return }
    }
    const { error } = await supabase.from('products').update({
      name: editProd.name, description: editProd.description,
      price: Number(editProd.price), stock: Number(editProd.stock),
      unit: editProd.unit, emoji: editProd.emoji, image: imageUrl,
      active: editProd.active, category: editProd.category || null,
    }).eq('id', editProd.id)
    if (error) showToast('Error al guardar: ' + error.message)
    else { setEditProd(null); showToast('Producto actualizado ✓'); fetchAll() }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) showToast('Error al eliminar: ' + error.message)
    else { showToast('Producto eliminado'); fetchAll() }
  }

  async function toggleActive(prod) {
    const { error } = await supabase.from('products').update({ active: !prod.active }).eq('id', prod.id)
    if (!error) fetchAll()
  }

  const total   = products.length
  const active  = products.filter(p => p.active).length
  const noStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length

  if (loading) return (
    <div style={{ ...t.page, ...t.center }}>
      <p style={{ color: '#94a3b8' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={t.page}>
      <header style={t.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#5ba3c9' }}>H</span>&amp;<span style={{ color: '#5ba3c9' }}>L</span>
          </span>
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'Productos' && (
            <button style={{ ...t.btnPrimary, fontSize: 13 }} onClick={() => setShowAdd(true)}>+ Agregar producto</button>
          )}
          <button style={t.btnGhost} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', gap: 4 }}>
        {TABS.map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            padding: '12px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: tab === tb ? '2px solid #5ba3c9' : '2px solid transparent',
            color: tab === tb ? '#5ba3c9' : '#64748b',
          }}>{tb}</button>
        ))}
      </div>

      <main style={t.main}>
        {tab === 'Productos' && (
          <ProductsTab
            products={products} total={total} active={active}
            noStock={noStock} lowStock={lowStock}
            onEdit={setEditProd} onDelete={handleDelete} onToggle={toggleActive}
          />
        )}
        {tab === 'Dashboard' && (
          <DashboardTab orders={orders} products={products} />
        )}
      </main>

      {editProd && (
        <div style={t.overlay} onClick={e => e.target === e.currentTarget && setEditProd(null)}>
          <div style={t.modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Editar producto</h2>
            <ProductForm data={editProd} onChange={setEditProd} onSave={handleSaveEdit} onCancel={() => setEditProd(null)} saving={saving} isEdit />
          </div>
        </div>
      )}

      {showAdd && (
        <div style={t.overlay} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={t.modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Agregar producto</h2>
            <ProductForm data={newProd} onChange={setNewProd} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
          </div>
        </div>
      )}

      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}

// ── Tab Productos ────────────────────────────────────────────────────────────
function ProductsTab({ products, total, active, noStock, lowStock, onEdit, onDelete, onToggle }) {
  return (
    <>
      <h1 style={t.pageTitle}>Gestión de Productos</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total productos', val: total,    bg: '#f1f5f9', col: '#475569' },
          { label: 'Activos',         val: active,   bg: '#dcfce7', col: '#15803d' },
          { label: 'Sin stock',       val: noStock,  bg: '#fee2e2', col: '#b91c1c' },
          { label: 'Stock bajo (≤5)', val: lowStock, bg: '#fef9c3', col: '#a16207' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 20px', minWidth: 130 }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.col }}>{s.val}</p>
            <p style={{ fontSize: 13, color: s.col, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={t.table}>
          <thead>
            <tr>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Unidad', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={t.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id} style={{ opacity: prod.active ? 1 : 0.45 }}>
                <td style={t.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22, background: prod.bg, borderRadius: 8, padding: '4px 8px' }}>{prod.emoji}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{prod.name}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{prod.description}</p>
                    </div>
                  </div>
                </td>
                <td style={{ ...t.td, color: '#64748b' }}>
                  {prod.category ? (
                    <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
                      {prod.category}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ ...t.td, fontWeight: 600 }}>${Number(prod.price).toLocaleString('es-AR')}</td>
                <td style={t.td}><span style={t.stockBadge(prod.stock)}>{prod.stock} u.</span></td>
                <td style={{ ...t.td, color: '#64748b' }}>{prod.unit}</td>
                <td style={t.td}>
                  <button onClick={() => onToggle(prod)} style={{
                    background: prod.active ? '#dcfce7' : '#f1f5f9',
                    color: prod.active ? '#15803d' : '#94a3b8',
                    border: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}>
                    {prod.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td style={t.td}>
                  <button style={t.btnEdit} onClick={() => onEdit({ ...prod })}>✏ Editar</button>
                  <button style={t.btnDanger} onClick={() => onDelete(prod.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Tab Dashboard ────────────────────────────────────────────────────────────
function DashboardTab({ orders, products }) {
  const [range, setRange] = useState('30')

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - Number(range))

  const filtered = orders.filter(o => new Date(o.created_at) >= cutoff)

  // KPIs
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0)
  const totalOrders  = filtered.length
  const avgTicket    = totalOrders ? totalRevenue / totalOrders : 0

  // Ventas por día (últimos N días)
  const salesByDay = useMemo(() => {
    const map = {}
    filtered.forEach(o => {
      const day = o.created_at?.slice(0, 10)
      if (day) map[day] = (map[day] || 0) + Number(o.total || 0)
    })
    // Generar todos los días del rango
    const days = []
    for (let i = Number(range) - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({ date: key, label: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }), total: map[key] || 0 })
    }
    return days
  }, [filtered, range])

  const maxDay = Math.max(...salesByDay.map(d => d.total), 1)

  // Top productos vendidos
  const topProducts = useMemo(() => {
    const map = {}
    filtered.forEach(o => {
      if (!o.items) return
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items
      items.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 }
        map[item.name].qty += item.qty || 0
        map[item.name].revenue += (item.price || 0) * (item.qty || 0)
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [filtered])

  // Ventas por categoría
  const byCategory = useMemo(() => {
    const map = {}
    filtered.forEach(o => {
      if (!o.items) return
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items
      items.forEach(item => {
        const cat = item.category || 'Sin categoría'
        if (!map[cat]) map[cat] = 0
        map[cat] += (item.price || 0) * (item.qty || 0)
      })
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const totalCatRevenue = byCategory.reduce((s, [, v]) => s + v, 0) || 1

  // Últimas órdenes
  const recentOrders = filtered.slice(0, 10)

  const statCard = (label, val, sub, bg, col) => (
    <div style={{ background: bg, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 160 }}>
      <p style={{ fontSize: 28, fontWeight: 800, color: col, marginBottom: 2 }}>{val}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: col }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: col, opacity: 0.65, marginTop: 2 }}>{sub}</p>}
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ ...t.pageTitle, marginBottom: 0 }}>Dashboard de Ventas</h1>
        <select
          value={range}
          onChange={e => setRange(e.target.value)}
          style={{ ...t.input, width: 'auto', padding: '8px 14px' }}
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {statCard('Ingresos totales', `$${totalRevenue.toLocaleString('es-AR')}`, `en ${range} días`, '#eff6ff', '#1d4ed8')}
        {statCard('Pedidos', totalOrders, 'completados', '#dcfce7', '#15803d')}
        {statCard('Ticket promedio', `$${Math.round(avgTicket).toLocaleString('es-AR')}`, 'por pedido', '#fef9c3', '#a16207')}
        {statCard('Productos activos', products.filter(p => p.active).length, 'en catálogo', '#f5f3ff', '#6d28d9')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Gráfico de barras — ventas por día */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Ventas por día</p>
          {salesByDay.every(d => d.total === 0) ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin datos en este período</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
              {salesByDay.map(d => (
                <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 24 }}>
                  <div
                    title={`${d.label}: $${d.total.toLocaleString('es-AR')}`}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: d.total > 0 ? '#5ba3c9' : '#e2e8f0',
                      height: `${Math.max(4, (d.total / maxDay) * 100)}px`,
                      transition: 'height 0.3s',
                    }}
                  />
                  {salesByDay.length <= 14 && (
                    <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 3, whiteSpace: 'nowrap' }}>{d.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ventas por categoría */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Ventas por categoría</p>
          {byCategory.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin datos en este período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byCategory.map(([cat, rev]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: '#64748b' }}>${rev.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(rev / totalCatRevenue) * 100}%`, background: '#5ba3c9', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Top productos */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top 5 productos</p>
          {topProducts.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin datos en este período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topProducts.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', minWidth: 18 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{p.qty} unidades vendidas</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>${p.revenue.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pedidos */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Últimos pedidos</p>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin pedidos en este período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentOrders.map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{o.customer_name || 'Cliente'}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(o.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>${Number(o.total || 0).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Formulario reutilizable ──────────────────────────────────────────────────
function ProductForm({ data, onChange, onSave, onCancel, saving, isEdit }) {
  const row = { display: 'flex', gap: 12 }
  const half = { flex: 1 }

  return (
    <div>
      <label style={t.label}>Nombre *</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.name} placeholder="Lavandina Concentrada"
        onChange={e => onChange(p => ({ ...p, name: e.target.value }))} />

      <label style={t.label}>Descripción</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.description} placeholder="Breve descripción"
        onChange={e => onChange(p => ({ ...p, description: e.target.value }))} />

      <label style={t.label}>Categoría</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.category || ''} placeholder="Ej: Limpieza, Desinfección, Hogar"
        onChange={e => onChange(p => ({ ...p, category: e.target.value }))} />

      <div style={row}>
        <div style={half}>
          <label style={t.label}>Precio ($) *</label>
          <input style={{ ...t.input, marginBottom: 14 }} type="number" value={data.price} placeholder="850"
            onChange={e => onChange(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div style={half}>
          <label style={t.label}>Stock</label>
          <input style={{ ...t.input, marginBottom: 14 }} type="number" value={data.stock} placeholder="20"
            onChange={e => onChange(p => ({ ...p, stock: e.target.value }))} />
        </div>
      </div>

      <label style={t.label}>Unidad</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.unit} placeholder="Ej: 1L, 500ml, 1kg"
        onChange={e => onChange(p => ({ ...p, unit: e.target.value }))} />

      <label style={t.label}>Imagen</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input type="file" accept="image/*" onChange={e => onChange(p => ({ ...p, imageFile: e.target.files[0] }))}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }} />
      </div>
      {data.imageFile && <p style={{ fontSize: 12, color: '#10b981', marginBottom: 14 }}>✓ {data.imageFile.name}</p>}

      <label style={t.label}>O pega una URL de imagen</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.image} placeholder="https://ejemplo.com/imagen.jpg"
        onChange={e => onChange(p => ({ ...p, image: e.target.value }))} />

      <label style={t.label}>Ícono (si no hay imagen)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {EMOJIS.map(em => (
          <button key={em} onClick={() => onChange(p => ({ ...p, emoji: em }))}
            style={{ fontSize: 22, padding: '4px 8px', border: `2px solid ${data.emoji === em ? '#5ba3c9' : 'transparent'}`, borderRadius: 6, background: data.emoji === em ? '#eff6ff' : '#f8fafc', cursor: 'pointer' }}>
            {em}
          </button>
        ))}
      </div>

      {isEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="active-check" checked={data.active}
            onChange={e => onChange(p => ({ ...p, active: e.target.checked }))} />
          <label htmlFor="active-check" style={{ ...t.label, marginBottom: 0, cursor: 'pointer' }}>
            Producto activo (visible en la tienda)
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={t.btnGhost} onClick={onCancel}>Cancelar</button>
        <button
          style={{ background: '#5ba3c9', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          onClick={onSave} disabled={saving}
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar producto'}
        </button>
      </div>
    </div>
  )
}
