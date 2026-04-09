import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext'
import { t } from '../styles'

export default function Header({ products = [] }) {
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const count = cartCount()

  return (
    <header style={t.hdr}>
      <Link to="/" style={t.logo}>
        <span style={t.logoAccent}>Limpi</span>Max
      </Link>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/" style={{ ...t.btnGhost, textDecoration: 'none', fontSize: 14 }}>
          Productos
        </Link>
        <button style={t.cartBtn} onClick={() => navigate('/cart')}>
          🛒 Carrito
          {count > 0 && <span style={t.cartBadge}>{count}</span>}
        </button>
      </div>
    </header>
  )
}
