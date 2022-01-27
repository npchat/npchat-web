export const authAlgorithm = {
  name: "ECDSA",
  hash: "SHA-256",
}

export async function sign(privCryptoKey, data) {
  return crypto.subtle.sign(authAlgorithm, privCryptoKey, data)
}

export async function verify(pubCryptoKey, signature, data) {
  return crypto.subtle.verify(authAlgorithm, pubCryptoKey, signature, data)
}
