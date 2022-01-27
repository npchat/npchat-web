import { aesKeyParams } from "./privacy.js"

export const authKeyParams = {
	name: "ECDSA",
	namedCurve: "P-256"
}

export const dhKeyParams = {
	name: "ECDH",
	namedCurve: "P-256"
}

export const dhDeriveKeyParams = publicKey => {
	return { name: "ECDH", public: publicKey }
}

export async function genAuthKeyPair() {
	return crypto.subtle.generateKey(authKeyParams, true, ["sign", "verify"])
}

export async function importAuthKey(format, keyData, keyUsages) {
	return crypto.subtle.importKey(format, keyData, authKeyParams, true, keyUsages)
}

export async function genDHKeyPair() {
	return crypto.subtle.generateKey(dhKeyParams, true, ["deriveKey", "deriveBits"])
}

export async function importDHKey(format, keyData, keyUsages) {
	return crypto.subtle.importKey(format, keyData, dhKeyParams, true, keyUsages)
}

export async function deriveDHSecret(publicKey, privateKey) {
	const params = dhDeriveKeyParams(publicKey)
	return crypto.subtle.deriveKey(params, privateKey, aesKeyParams, true, ["encrypt", "decrypt"])
}

export async function getBytesFromPrivateCryptoKey(key) {
	const jwk = await crypto.subtle.exportKey("jwk", key)
	return new TextEncoder().encode(JSON.stringify(jwk))
}

export async function getPrivateCryptoKeyFromBytes(bytes, algorithmIdentifier, keyUsages) {
	const jwk = JSON.parse(new TextDecoder().decode(bytes))
	return crypto.subtle.importKey("jwk", jwk, algorithmIdentifier, true, keyUsages)
}