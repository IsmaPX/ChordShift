import { ipcMain } from 'electron'
import path from 'path'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)

function getTwilioConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
  }
}

function requireTwilio() {
  try {
    return _require(path.join(process.resourcesPath, 'node_modules/twilio'))
  } catch {
    return _require('twilio')
  }
}

export function registerIpcHandlers() {
  ipcMain.handle('send-otp', async (_event, phone: string, code: string) => {
    const { sid, token, from } = getTwilioConfig()
    if (!sid || !token || !from) {
      return { success: true, simulated: true }
    }
    try {
      const twilio = requireTwilio()
      await twilio(sid, token).messages.create({
        body: `Tu código de verificación es: ${code}`,
        from: `whatsapp:${from}`,
        to: `whatsapp:${phone}`,
      })
      return { success: true }
    } catch (err: unknown) {
      console.error('[IPC] send-otp error:', err)
      throw new Error((err instanceof Error ? err.message : 'Failed to send OTP'), { cause: err })
    }
  })

  ipcMain.handle('send-whatsapp', async (_event, phone: string, message: string) => {
    const { sid, token, from } = getTwilioConfig()
    if (!sid || !token || !from) {
      return { success: true, simulated: true }
    }
    try {
      const twilio = requireTwilio()
      await twilio(sid, token).messages.create({
        body: message,
        from: `whatsapp:${from}`,
        to: `whatsapp:${phone}`,
      })
      return { success: true }
    } catch (err: unknown) {
      console.error('[IPC] send-whatsapp error:', err)
      throw new Error((err instanceof Error ? err.message : 'Failed to send WhatsApp'), { cause: err })
    }
  })
}
