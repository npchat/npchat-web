import { aesKeyParams } from "../util/privacy.js"
import { fromBase64, toBase64 } from "../util/base64.js"

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

export function getValuesFromJwk(jwk) {
  const values = {
    x: fromBase64(jwk.x),
    y: fromBase64(jwk.y),
  }
  if (jwk.d) values.d = fromBase64(jwk.d)
  return values
}

export function getJwkFromValues(values, keyOps) {
  const jwk = {
    crv: "P-256",
    ext: true,
    key_ops: keyOps,
    kty: "EC",
    x: toBase64(values.x),
    y: toBase64(values.y),
  }
  if (values.d) jwk.d = toBase64(values.d)
  return jwk
}

export async function generateKeys() {
  const authKeyPair = await genAuthKeyPair()
  const dhKeyPair = await genDHKeyPair()
  return {
    auth: {
      jwk: {
        publicKey: await crypto.subtle.exportKey("jwk", authKeyPair.publicKey),
        privateKey: await crypto.subtle.exportKey(
          "jwk",
          authKeyPair.privateKey
        ),
      },
    },
    dh: {
      jwk: {
        publicKey: await crypto.subtle.exportKey("jwk", dhKeyPair.publicKey),
        privateKey: await crypto.subtle.exportKey("jwk", dhKeyPair.privateKey),
      },
    },
  }
}
