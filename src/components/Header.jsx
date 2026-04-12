import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext'
import { t } from '../styles'

export default function Header() {
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const count = cartCount()

  return (
    <header style={t.hdr}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        {/* Logo SVG con forma de burbuja */}
        <svg width="40" height="40" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
          {/* Forma de gota/burbuja blanca con borde azul */}
          <path 
            d="M 30 80 Q 30 40 60 30 Q 100 20 140 30 Q 170 40 170 80 Q 170 120 150 150 Q 130 180 100 185 Q 70 180 50 150 Q 30 120 30 80 Z" 
            fill="#ffffff"
            stroke="#5ba3c9"
            strokeWidth="8"
          />
          {/* Texto H&L en azul dentro de la burbuja */}
          <text 
            x="100" 
            y="125" 
            fontFamily="Arial, sans-serif" 
            fontSize="60" 
            fontWeight="800" 
            textAnchor="middle" 
            fill="#5ba3c9"
          >
            H&amp;L
          </text>
        </svg>
        
        <span style={t.logo}>
          <span style={t.logoAccent}>H</span>&amp;<span style={t.logoAccent}>L</span>
        </span>
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
