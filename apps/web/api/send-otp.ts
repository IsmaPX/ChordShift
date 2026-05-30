import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validatePhone, validateCode } from './shared'
import { checkRateLimit } from './rateLimit'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!checkRateLimit(req.headers['x-forwarded-for'] as string || 'unknown')) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { phone, code } = req.body

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number (expected E.164 format)' })
  }

  if (!validateCode(code)) {
    return res.status(400).json({ error: 'Invalid code (expected 4-8 digits)' })
  }

  const message = `🎹 Worship Piano App\n\nTu código de verificación es: ${code}\n\nEste código expira en 10 minutos.`

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.warn('[send-otp] simulated: missing Twilio credentials')
    return res.status(200).json({
      success: true,
      simulated: true,
    })
  }

  try {
    const twilio = await import('twilio')
    const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`,
      body: message,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[send-otp] Twilio error:', err)
    return res.status(500).json({
      error: 'Failed to send OTP',
    })
  }
}
