import { base58 } from "./base58"

export const authAlgorithm = {
	name: "ECDSA",
	hash: "SHA-256"
}

export async function signChallenge(privateKey, challengeText) {
	const bytes = new base58().decode(challengeText)
	const sig = new Uint8Array(await sign(privateKey, bytes))
	return base58().encode(sig)
}

export async function sign(privCryptoKey, bytes) {
	return crypto.subtle.sign(authAlgorithm, privCryptoKey, bytes)
}

export async function verify(pubCryptoKey, signature, bytes) {
	return crypto.subtle.verify(authAlgorithm, pubCryptoKey, signature, bytes)
}