import { authAlgorithm } from "./auth"
import { aesKeyParams } from "./privacy"

export const authKeyParams = {
	name: "ECDSA",
	namedCurve: "P-256"
}

export const dhKeyParams = {
	name: "ECDH",
	namedCurve: "P-256"
}

export const dhDeriveKeyParams = publicKey => { return { name: "ECDH", public: publicKey } }

export async function genAuthKeyPair() {
	return crypto.subtle.generateKey(authKeyParams, true, ["sign", "verify"])
}

export async function importAuthKey(jwk, keyUsages) {
	return crypto.subtle.importKey("jwk", jwk, authKeyParams, true, keyUsages)
}

export async function importAuthKeyV2(format, keyData, keyUsages) {
	return crypto.subtle.importKey(format, keyData, authAlgorithm, true, keyUsages)
}

export async function genDHKeyPair() {
	return crypto.subtle.generateKey(dhKeyParams, true, ["deriveKey", "deriveBits"])
}

export async function importDHKey(jwk, keyUsages) {
	return crypto.subtle.importKey("jwk", jwk, dhKeyParams, true, keyUsages)
}

export async function deriveKey(publicKey, privateKey) {
	const params = dhDeriveKeyParams(publicKey)
	return crypto.subtle.deriveKey(params, privateKey, aesKeyParams, true, ["encrypt", "decrypt"])
}

export async function exportKey(cryptoKey, format = "jwk") {
	return crypto.subtle.exportKey(format, cryptoKey)
}

export function getJwkBytes(jwk) {
	const str = JSON.stringify(jwk)
	return new TextEncoder().encode(str)
}