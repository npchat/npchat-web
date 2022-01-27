import { aesKeyParams } from "../util/privacy.js"
import { hash } from "../util/hash.js"
import { toBase64 } from "../util/base64.js"

const authKeyParams = {
  name: "ECDSA",
  namedCurve: "P-256",
}

const dhKeyParams = {
  name: "ECDH",
  namedCurve: "P-256",
}

async function genAuthKeyPair() {
  return crypto.subtle.generateKey(authKeyParams, true, ["sign", "verify"])
}

async function genDHKeyPair() {
  return crypto.subtle.generateKey(dhKeyParams, true, [
    "deriveKey",
    "deriveBits",
  ])
}

export async function importAuthKey(format, keyData, keyUsages) {
  return crypto.subtle.importKey(
    format,
    keyData,
    authKeyParams,
    true,
    keyUsages
  )
}

export async function importDHKey(format, keyData, keyUsages) {
  return crypto.subtle.importKey(format, keyData, dhKeyParams, true, keyUsages)
}

function getDHDeriveKeyParams(publicKey) {
  return { name: "ECDH", public: publicKey }
}

export async function deriveDHSecret(publicKey, privateKey) {
  const params = getDHDeriveKeyParams(publicKey)
  return crypto.subtle.deriveKey(params, privateKey, aesKeyParams, true, [
    "encrypt",
    "decrypt",
  ])
}

export async function generateKeys() {
  const keys = {
    auth: {
      keyPair: await genAuthKeyPair(),
    },
    dh: {
      keyPair: await genDHKeyPair(),
    },
  }
  keys.auth.publicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", keys.auth.keyPair.publicKey)
  )
  keys.auth.jwk = {
    publicKey: await crypto.subtle.exportKey(
      "jwk",
      keys.auth.keyPair.publicKey
    ),
    privateKey: await crypto.subtle.exportKey(
      "jwk",
      keys.auth.keyPair.privateKey
    ),
  }
  keys.pubKeyHash = toBase64(new Uint8Array(await hash(keys.auth.publicKeyRaw)))
  keys.dh.jwk = {
    publicKey: await crypto.subtle.exportKey("jwk", keys.dh.keyPair.publicKey),
    privateKey: await crypto.subtle.exportKey(
      "jwk",
      keys.dh.keyPair.privateKey
    ),
  }
  return keys
}
