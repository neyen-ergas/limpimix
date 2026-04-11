// Estilos compartidos en toda la app
export const t = {
  // Layout
  page:    { minHeight: '100vh', background: '#f8fafc' },
  main:    { maxWidth: 1100, margin: '0 auto', padding: '28px 20px' },
  center:  { display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Header
  hdr: {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '0 24px', height: 58,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
  },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', textDecoration: 'none', color: '#0f172a' },
  logoAccent: { color: '#5ba3c9' },

  // Buttons
  btnPrimary: {
    background: '#5ba3c9', color: '#fff', border: 'none',
    padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  btnGhost: {
    background: 'none', color: '#64748b', border: '1px solid #e2e8f0',
    padding: '8px 14px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
  btnGreen: {
    background: '#25d366', color: '#fff', border: 'none',
    padding: '13px 20px', borderRadius: 10, fontSize: 16, fontWeight: 700,
    cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnDanger: {
    background: 'none', color: '#ef4444', border: '1px solid #fecaca',
    padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  },
  btnEdit: {
    background: 'none', color: '#475569', border: '1px solid #e2e8f0',
    padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', marginRight: 6,
  },

  // Cart button with badge
  cartBtn: {
    background: '#5ba3c9', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },
  cartBadge: {
    background: '#fff', color: '#5ba3c9', borderRadius: '50%',
    width: 20, height: 20, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 11, fontWeight: 700,
  },

  // Cards
  card: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
    overflow: 'hidden',
  },

  // Product grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 16,
  },

  // Form elements
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, outline: 'none',
    background: '#fff', color: '#0f172a',
  },
  label: { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 },

  // Modal overlay (fixed is OK when intentional)
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 28,
    width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
  },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' },
  th: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '13px 16px', fontSize: 14, borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' },

  // Toast
  toast: {
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    background: '#1e293b', color: '#fff', padding: '10px 22px',
    borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },

  // Page titles
  pageTitle: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 },
  pageSub:   { fontSize: 15, color: '#64748b', marginBottom: 24 },

  // Stock badge
  stockBadge(n) {
    return {
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 20, fontSize: 13, fontWeight: 600,
      background: n > 10 ? '#dcfce7' : n > 4 ? '#fef9c3' : '#fee2e2',
      color:      n > 10 ? '#15803d' : n > 4 ? '#a16207' : '#b91c1c',
    }
  },
}

export const EMOJIS = ['🧴','🍋','💪','🫧','✨','🌸','🧸','🛡️','🧹','🪣','🫙','🧽']
export const PALETTE = [
  { bg: '#dbeafe', col: '#1d4ed8' }, { bg: '#dcfce7', col: '#15803d' },
  { bg: '#fef9c3', col: '#a16207' }, { bg: '#fce7f3', col: '#be185d' },
  { bg: '#ede9fe', col: '#6d28d9' }, { bg: '#ffedd5', col: '#c2410c' },
]
