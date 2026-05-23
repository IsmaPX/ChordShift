import type { VercelRequest, VercelResponse } from '@vercel/node'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone, code } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'phone and code are required' })
  }

  const message = `🎹 Worship Piano App\n\nTu código de verificación es: ${code}\n\nEste código expira en 10 minutos.`

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return res.status(200).json({
      success: true,
      simulated: true,
      code,
      message: `[SIMULATED] OTP ${code} sent to ${phone}`,
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
    console.error('Twilio error:', err)
    return res.status(500).json({
      error: 'Failed to send OTP',
      details: err instanceof Error ? err.message : String(err),
    })
  }
}
