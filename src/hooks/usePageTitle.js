import { useEffect, useRef } from 'react'

export function usePageTitle(title = 'H&L — Productos de Limpieza') {
  const originalTitle = useRef(title)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Establecer título inicial
    document.title = title
    originalTitle.current = title

    // Detectar cuando el usuario sale de la pestaña
    function handleVisibilityChange() {
      if (document.hidden) {
        // Usuario salió de la pestaña - iniciar animación
        let toggle = false
        intervalRef.current = setInterval(() => {
          document.title = toggle ? '🛒 Seguí comprando en H&L' : originalTitle.current
          toggle = !toggle
        }, 1500)
      } else {
        // Usuario volvió a la pestaña - detener animación
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        document.title = originalTitle.current
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.title = originalTitle.current
    }
  }, [title])
}
