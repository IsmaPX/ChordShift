import { ipcMain } from 'electron'

function getTwilioConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
  }
}

export function registerIpcHandlers() {
  ipcMain.handle('send-otp', async (_event, phone: string, code: string) => {
    const { sid, token, from } = getTwilioConfig()
    if (!sid || !token || !from) {
      return { success: true, simulated: true }
    }
    try {
      const twilio = require('twilio')
      await twilio(sid, token).messages.create({
        body: `Tu código de verificación es: ${code}`,
        from: `whatsapp:${from}`,
        to: `whatsapp:${phone}`,
      })
      return { success: true }
    } catch (err: any) {
      console.error('[IPC] send-otp error:', err)
      throw new Error(err.message || 'Failed to send OTP')
    }
  })

  ipcMain.handle('send-whatsapp', async (_event, phone: string, message: string) => {
    const { sid, token, from } = getTwilioConfig()
    if (!sid || !token || !from) {
      return { success: true, simulated: true }
    }
    try {
      const twilio = require('twilio')
      await twilio(sid, token).messages.create({
        body: message,
        from: `whatsapp:${from}`,
        to: `whatsapp:${phone}`,
      })
      return { success: true }
    } catch (err: any) {
      console.error('[IPC] send-whatsapp error:', err)
      throw new Error(err.message || 'Failed to send WhatsApp')
    }
  })
}
