import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { t, EMOJIS, PALETTE } from '../styles'

export default function AdminPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [editProd, setEditProd] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newProd, setNewProd] = useState({ name: '', description: '', price: '', stock: '', unit: '', emoji: '🧴', image: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  // Verificar autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/admin', { replace: true }); return }
      setSession(data.session)
      fetchProducts()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') navigate('/admin', { replace: true })
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    // Admin ve todos los productos, incluso los inactivos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')
    if (!error) setProducts(data)
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
      
      // Local testing: convert to data URL
      if (import.meta.env.MODE === 'development') {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            showToast('✓ Imagen cargada (modo local)')
            resolve(e.target.result)
          }
          reader.readAsDataURL(file)
        })
      }
      
      // Production: upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (err) {
      showToast('Error al subir imagen: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // ── CRUD ──────────────────────────────────────────────

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
      name:        newProd.name,
      description: newProd.description,
      price:       Number(newProd.price),
      stock:       Number(newProd.stock) || 0,
      unit:        newProd.unit,
      emoji:       newProd.emoji,
      image:       imageUrl,
      bg:          c.bg,
      col:         c.col,
    })
    if (error) showToast('Error al agregar: ' + error.message)
    else {
      setNewProd({ name: '', description: '', price: '', stock: '', unit: '', emoji: '🧴', image: '' })
      setShowAdd(false)
      showToast('Producto agregado ✓')
      fetchProducts()
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
    
    const { error } = await supabase
      .from('products')
      .update({
        name:        editProd.name,
        description: editProd.description,
        price:       Number(editProd.price),
        stock:       Number(editProd.stock),
        unit:        editProd.unit,
        emoji:       editProd.emoji,
        image:       imageUrl,
        active:      editProd.active,
      })
      .eq('id', editProd.id)
    if (error) showToast('Error al guardar: ' + error.message)
    else { setEditProd(null); showToast('Producto actualizado ✓'); fetchProducts() }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) showToast('Error al eliminar: ' + error.message)
    else { showToast('Producto eliminado'); fetchProducts() }
  }

  async function toggleActive(prod) {
    const { error } = await supabase.from('products').update({ active: !prod.active }).eq('id', prod.id)
    if (!error) fetchProducts()
  }

  // ── STATS ─────────────────────────────────────────────
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
      {/* Header admin */}
      <header style={t.hdr}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#0ea5e9' }}>Limpi</span>Max
          </span>
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...t.btnPrimary, fontSize: 13 }} onClick={() => setShowAdd(true)}>+ Agregar producto</button>
          <button style={t.btnGhost} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main style={t.main}>
        <h1 style={t.pageTitle}>Gestión de Productos</h1>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total productos', val: total, bg: '#f1f5f9', col: '#475569' },
            { label: 'Activos',         val: active,  bg: '#dcfce7', col: '#15803d' },
            { label: 'Sin stock',       val: noStock, bg: '#fee2e2', col: '#b91c1c' },
            { label: 'Stock bajo (≤5)', val: lowStock, bg: '#fef9c3', col: '#a16207' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 20px', minWidth: 130 }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.col }}>{s.val}</p>
              <p style={{ fontSize: 13, color: s.col, opacity: 0.75 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={t.table}>
            <thead>
              <tr>
                {['Producto', 'Precio', 'Stock', 'Unidad', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={t.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} style={{ opacity: prod.active ? 1 : 0.45 }}>
                  <td style={t.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22, background: prod.bg, borderRadius: 8, padding: '4px 8px' }}>
                        {prod.emoji}
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{prod.name}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>{prod.description}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...t.td, fontWeight: 600 }}>${Number(prod.price).toLocaleString('es-AR')}</td>
                  <td style={t.td}><span style={t.stockBadge(prod.stock)}>{prod.stock} u.</span></td>
                  <td style={{ ...t.td, color: '#64748b' }}>{prod.unit}</td>
                  <td style={t.td}>
                    <button
                      onClick={() => toggleActive(prod)}
                      style={{
                        background: prod.active ? '#dcfce7' : '#f1f5f9',
                        color: prod.active ? '#15803d' : '#94a3b8',
                        border: 'none', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      {prod.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={t.td}>
                    <button style={t.btnEdit} onClick={() => setEditProd({ ...prod })}>✏ Editar</button>
                    <button style={t.btnDanger} onClick={() => handleDelete(prod.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL EDITAR */}
      {editProd && (
        <div style={t.overlay} onClick={e => e.target === e.currentTarget && setEditProd(null)}>
          <div style={t.modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Editar producto</h2>
            <ProductForm
              data={editProd}
              onChange={setEditProd}
              onSave={handleSaveEdit}
              onCancel={() => setEditProd(null)}
              saving={saving}
              isEdit
            />
          </div>
        </div>
      )}

      {/* MODAL AGREGAR */}
      {showAdd && (
        <div style={t.overlay} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={t.modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Agregar producto</h2>
            <ProductForm
              data={newProd}
              onChange={setNewProd}
              onSave={handleAdd}
              onCancel={() => setShowAdd(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {toast && <div style={t.toast}>{toast}</div>}
    </div>
  )
}

// ── Formulario reutilizable para agregar y editar ────────────────────────────
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
      {data.imageFile && <p style={{ fontSize: 12, color: '#10b981', marginBottom: 14 }}>✓ Archivo seleccionado: {data.imageFile.name}</p>}
      
      <label style={t.label}>O pega una URL de imagen</label>
      <input style={{ ...t.input, marginBottom: 14 }} value={data.image} placeholder="https://ejemplo.com/imagen.jpg"
        onChange={e => onChange(p => ({ ...p, image: e.target.value }))} />

      <label style={t.label}>Ícono (si no hay imagen)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {EMOJIS.map(em => (
          <button key={em} onClick={() => onChange(p => ({ ...p, emoji: em }))}
            style={{ fontSize: 22, padding: '4px 8px', border: `2px solid ${data.emoji === em ? '#0ea5e9' : 'transparent'}`, borderRadius: 6, background: data.emoji === em ? '#eff6ff' : '#f8fafc', cursor: 'pointer' }}>
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
          style={{ background: '#10b981', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          onClick={onSave} disabled={saving}
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar producto'}
        </button>
      </div>
    </div>
  )
}
