import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function useServiceWorker() {
  const location = useLocation()

  useEffect(() => {
    if (window.isElectron) return
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('SW registered:', registration)
        },
        (error) => {
          console.log('SW registration failed:', error)
        }
      )
    }
  }, [location.pathname])
}