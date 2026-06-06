import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './lib/router'
import { LanguageProvider } from './lib/i18n/LanguageProvider'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { AudioGateProvider } from './contexts/AudioGateContext'
import { AudioGate } from './components/ui/AudioGate'
import { syncManager } from './lib/sync/syncManager'
import { getSocketClient } from './lib/socket/socketClient'
import './index.css'

// Inicializar sync manager: detecta online/offline y procesa el outbox.
syncManager.init()

// Inicializar cliente Socket.IO (singleton, con reconexión automática).
// Sólo conecta si hay token en el store.
getSocketClient()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

if (!('isElectron' in window) && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <OnboardingProvider>
          <AudioGateProvider>
            <AudioGate>
              <RouterProvider router={router} />
            </AudioGate>
          </AudioGateProvider>
        </OnboardingProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
