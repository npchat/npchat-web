import { aesKeyParams } from "./privacy.js"
import { hash } from "./hash.js"
import { toHex } from "./hex.js"

const authKeyParams = {
	name: "ECDSA",
	namedCurve: "P-256"
}

const dhKeyParams = {
	name: "ECDH",
	namedCurve: "P-256"
}

async function genAuthKeyPair() {
	return crypto.subtle.generateKey(authKeyParams, true, ["sign", "verify"])
}

async function genDHKeyPair() {
	return crypto.subtle.generateKey(dhKeyParams, true, ["deriveKey", "deriveBits"])
}

export async function importAuthKey(format, keyData, keyUsages) {
	return crypto.subtle.importKey(format, keyData, authKeyParams, true, keyUsages)
}

export async function importDHKey(format, keyData, keyUsages) {
	return crypto.subtle.importKey(format, keyData, dhKeyParams, true, keyUsages)
}

export function getDHDeriveKeyParams(publicKey) {
	return { name: "ECDH", public: publicKey }
}

export async function deriveDHSecret(publicKey, privateKey) {
	const params = getDHDeriveKeyParams(publicKey)
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

export async function generateKeys() {
	const keys = {
		auth: {
			keyPair: await genAuthKeyPair()
		},
		dh: {
			keyPair: await genDHKeyPair()
		}
	}
	keys.auth.raw = {
		publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", keys.auth.keyPair.publicKey)),
		privateKey: await getBytesFromPrivateCryptoKey(keys.auth.keyPair.privateKey)
	}
	keys.auth.jwk = {
		publicKey: await crypto.subtle.exportKey("jwk", keys.auth.keyPair.publicKey),
		privateKey: await crypto.subtle.exportKey("jwk", keys.auth.keyPair.privateKey)
	}
	keys.pubKeyHash = toHex(new Uint8Array(await hash(keys.auth.raw.publicKey)))
	keys.dh.raw = {
		publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", keys.dh.keyPair.publicKey)),
		privateKey: await getBytesFromPrivateCryptoKey(keys.dh.keyPair.privateKey)
	}
	console.log("Generated fresh ECDSA P-256 & ECDH P-256 key pairs")

	return keys
}