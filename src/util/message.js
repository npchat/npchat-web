import { pack } from "msgpackr"
import { sign, verify } from "./auth.js"
import { hash } from "./hash.js"
import { deriveDHSecret } from "./keys.js"
import { encrypt, getIV } from "./privacy.js"
import { toHex } from "./hex.js"
import { isEqual } from "./bytes.js"

export async function buildMessage(
  authPriv,
  dhPrivateKey,
  msgText,
  from,
  dhPublicKey
) {
  const t = Date.now()
  const iv = await getIV(toHex(from) + t)
  const ivBytes = new Uint8Array(iv)
  const derivedKey = await deriveDHSecret(dhPublicKey, dhPrivateKey)
  const encrypted = await encrypt(
    iv,
    derivedKey,
    new TextEncoder().encode(msgText)
  )
  const encryptedBytes = new Uint8Array(encrypted)
  const associatedBytes = pack({ t, f: from })
  const bytesToHash = new Uint8Array([
    ...ivBytes,
    ...encryptedBytes,
    ...associatedBytes,
  ])
  const messageHash = new Uint8Array(await hash(bytesToHash))
  const message = {
    t,
    iv: ivBytes,
    m: encryptedBytes,
    f: from,
    h: messageHash,
  }
  const hashSig = new Uint8Array(await sign(authPriv, messageHash))
  message.s = hashSig
  return message
}

export async function verifyMessage(authPub, msg) {
  if (!msg.t || !msg.iv || !msg.m || !msg.f || !msg.h || !msg.s) {
    return false
  }
  const associatedBytes = pack({ t: msg.t, f: msg.f })
  const bytesToHash = new Uint8Array([...msg.iv, ...msg.m, ...associatedBytes])
  const hashed = new Uint8Array(await hash(bytesToHash))
  if (!isEqual(hashed, msg.h)) {
    return false
  }
  return verify(authPub, msg.s, hashed)
}
