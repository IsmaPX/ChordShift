import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { useUserSettings, useSendWhatsApp } from './useUserSettings'

export function useWhatsAppReminder() {
  const { user } = useAuth()
  const { data: settings } = useUserSettings()
  const sendWhatsApp = useSendWhatsApp()
  const sentRef = useRef(false)

  useEffect(() => {
    if (!user || !settings || sentRef.current) return
    if (!settings.phone_number || !settings.phone_verified) return
    if (!settings.notifications_enabled) return

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const dayOfWeek = today.getDay()
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()

    if (settings.last_reminder_sent === todayStr) return
    if (!settings.reminder_days.includes(dayOfWeek)) return

    const [remH, remM] = settings.reminder_time.split(':').map(Number)
    const currentTotalMin = currentHour * 60 + currentMinute
    const reminderTotalMin = remH * 60 + remM

    const minDiff = currentTotalMin - reminderTotalMin
    if (minDiff < 0 || minDiff > 30) return

    const streak = 0

    const messages = [
      `🎹 ¡Hora de practicar!\n\nHoy es un gran día para mejorar en el piano. Abre Worship Piano App y sigue entrenando tu oído y tus habilidades. 🎶`,
      `🎹 Recordatorio de práctica\n\nNo olvides tu sesión de hoy. ${streak > 0 ? `Llevas ${streak} días de racha. ¡Sigue así! 🔥` : 'Cada minuto cuenta.'}`,
      `🎹 Worship Piano App\n\nTu práctica diaria te espera. 15 minutos hoy pueden hacer una gran diferencia. ¡Vamos! 💪`,
    ]

    const randomMsg = messages[Math.floor(Math.random() * messages.length)]

    sentRef.current = true

    sendWhatsApp.mutate(
      { phone: settings.phone_number, message: randomMsg },
      {
        onSuccess: async () => {
          const { db } = await import('@/lib/db')
          const id = localStorage.getItem('worship_piano_active_profile')
          if (id) {
            const profile = await db.users.get(id)
            if (profile) {
              const newSettings = { ...profile.settings, last_reminder_sent: todayStr }
              await db.users.update(id, { settings: newSettings })
            }
          }
        },
      }
    )
  }, [user, settings, sendWhatsApp])
}
