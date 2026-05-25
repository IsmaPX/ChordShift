import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockMessagesCreate = vi.fn()
const mockTwilio = vi.fn(() => ({
  messages: { create: mockMessagesCreate },
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}))

vi.mock('twilio', () => ({
  default: mockTwilio,
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('TWILIO_ACCOUNT_SID', '')
  vi.stubEnv('TWILIO_AUTH_TOKEN', '')
  vi.stubEnv('TWILIO_WHATSAPP_NUMBER', '')
})

describe('registerIpcHandlers', () => {
  async function getHandlers() {
    const { ipcMain } = await import('electron')
    const { registerIpcHandlers: register } = await import('./ipc-handlers')
    register()
    const handlers = new Map<string, Function>()
    for (const call of (ipcMain.handle as any).mock.calls) {
      handlers.set(call[0], call[1])
    }
    return handlers
  }

  it('registers send-otp and send-whatsapp handlers', async () => {
    const handlers = await getHandlers()
    expect(handlers.has('send-otp')).toBe(true)
    expect(handlers.has('send-whatsapp')).toBe(true)
  })

  it('returns simulated=true when env vars are missing (send-otp)', async () => {
    const handlers = await getHandlers()
    const result = await handlers.get('send-otp')(null, '+1234567890', '123456')
    expect(result).toEqual({ success: true, simulated: true })
    expect(mockTwilio).not.toHaveBeenCalled()
  })

  it('returns simulated=true when env vars are missing (send-whatsapp)', async () => {
    const handlers = await getHandlers()
    const result = await handlers.get('send-whatsapp')(null, '+1234567890', 'Hello')
    expect(result).toEqual({ success: true, simulated: true })
    expect(mockTwilio).not.toHaveBeenCalled()
  })

  it('calls twilio when env vars are present (send-otp)', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'test_sid')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test_token')
    vi.stubEnv('TWILIO_WHATSAPP_NUMBER', '+1234567890')
    mockMessagesCreate.mockResolvedValueOnce({ sid: 'msg_sid' })

    const handlers = await getHandlers()
    const result = await handlers.get('send-otp')(null, '+1234567890', '123456')

    expect(mockTwilio).toHaveBeenCalledWith('test_sid', 'test_token')
    expect(mockMessagesCreate).toHaveBeenCalledWith({
      body: 'Tu código de verificación es: 123456',
      from: 'whatsapp:+1234567890',
      to: 'whatsapp:+1234567890',
    })
    expect(result).toEqual({ success: true })
  })

  it('calls twilio when env vars are present (send-whatsapp)', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'test_sid')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test_token')
    vi.stubEnv('TWILIO_WHATSAPP_NUMBER', '+1234567890')
    mockMessagesCreate.mockResolvedValueOnce({ sid: 'msg_sid' })

    const handlers = await getHandlers()
    const result = await handlers.get('send-whatsapp')(null, '+1234567890', 'Test message')

    expect(mockTwilio).toHaveBeenCalledWith('test_sid', 'test_token')
    expect(mockMessagesCreate).toHaveBeenCalledWith({
      body: 'Test message',
      from: 'whatsapp:+1234567890',
      to: 'whatsapp:+1234567890',
    })
    expect(result).toEqual({ success: true })
  })

  it('throws on twilio error', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'test_sid')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test_token')
    vi.stubEnv('TWILIO_WHATSAPP_NUMBER', '+1234567890')
    mockMessagesCreate.mockRejectedValueOnce(new Error('API error'))

    const handlers = await getHandlers()
    await expect(handlers.get('send-otp')(null, '+1234567890', '123456')).rejects.toThrow('API error')
  })
})
