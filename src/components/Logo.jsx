export default function Logo({ size = 40 }) {
  return (
    <img 
      src="/logo.png" 
      alt="H&L" 
      width={size} 
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
