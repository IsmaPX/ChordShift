import type { VercelRequest, VercelResponse } from '@vercel/node'
import { validatePhone, validateMessage } from './shared'
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

  const { phone, message } = req.body

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number (expected E.164 format)' })
  }

  if (!validateMessage(message)) {
    return res.status(400).json({ error: 'Invalid message (expected 1-1000 characters)' })
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.warn('[send-whatsapp] simulated: missing Twilio credentials')
    return res.status(200).json({
      success: true,
      simulated: true,
    })
  }

  try {
    const twilio = await import('twilio')
    const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    const twilioMsg = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`,
      body: message,
    })

    return res.status(200).json({
      success: true,
      sid: twilioMsg.sid,
    })
  } catch (err) {
    console.error('[send-whatsapp] Twilio error:', err)
    return res.status(500).json({
      error: 'Failed to send WhatsApp message',
    })
  }
}
