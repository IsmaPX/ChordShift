/**
 * Service worker para Web Push.
 *
 * Se registra desde `usePushNotifications.ts`.
 * Maneja el evento `push` (llegada de notificación) y `notificationclick`
 * (click en la notificación → abrir URL).
 */

self.addEventListener('push', event => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Worship Piano', body: event.data.text() }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag,
    data: payload.data || {},
    requireInteraction: payload.requireInteraction,
  }

  event.waitUntil(self.registration.showNotification(payload.title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      // Si hay una ventana abierta, navegar ahí
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Si no, abrir nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    }),
  )
})
