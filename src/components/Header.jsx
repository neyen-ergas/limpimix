import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext'
import { t } from '../styles'
import Logo from './Logo'

export default function Header() {
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const count = cartCount()

  return (
    <header style={t.hdr}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Logo size={48} />
      </Link>

      <nav style={t.nav}>
        <Link to="/" style={t.navLink}>Shop</Link>
        <div style={t.cartIcon} onClick={() => navigate('/cart')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4a5568' }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {count > 0 && <span style={t.cartBadge}>{count}</span>}
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4a5568', cursor: 'pointer' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </nav>
    </header>
  )
}
