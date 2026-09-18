import crypto from 'crypto'

const KEY = crypto.createHash('sha256')
  .update(process.env.URL_ENCRYPT_KEY || 'grace-academy-url-key-2025')
  .digest()

const IV_LEN  = 12
const TAG_LEN = 16

export function encryptId(id) {
  const iv     = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const enc    = Buffer.concat([cipher.update(String(id), 'utf8'), cipher.final()])
  const tag    = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64url')
}

export function decryptId(token) {
  try {
    const buf = Buffer.from(token, 'base64url')
    if (buf.length <= IV_LEN + TAG_LEN) return null
    const iv  = buf.subarray(0, IV_LEN)
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
    const enc = buf.subarray(IV_LEN + TAG_LEN)
    const dec = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
    dec.setAuthTag(tag)
    return Buffer.concat([dec.update(enc), dec.final()]).toString('utf8')
  } catch {
    return null
  }
}
