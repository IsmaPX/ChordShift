const VALID_PHONE = /^\+[1-9]\d{6,14}$/
const VALID_CODE = /^\d{4,8}$/

export function validatePhone(phone: unknown): phone is string {
  return typeof phone === 'string' && VALID_PHONE.test(phone)
}

export function validateCode(code: unknown): code is string {
  return typeof code === 'string' && VALID_CODE.test(code)
}

export function validateMessage(msg: unknown): msg is string {
  return typeof msg === 'string' && msg.length > 0 && msg.length <= 1000
}
