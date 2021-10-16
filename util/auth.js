import { base58 } from "./base58"

export const authAlgorithm = {
	name: "ECDSA",
	hash: "SHA-256"
}

export function hasChallengeExpired(challenge) {
	if (!challenge || !challenge.exp) {
		return true
	}
	if (Date.now() > challenge.exp) {
		return true
	}
	return false
}

export async function signChallenge(privateKey, challengeText) {
	const bytes = new TextEncoder().encode(challengeText)
	const sig = new Uint8Array(await sign(privateKey, bytes))
	return base58().encode(sig)
}

export async function sign(privCryptoKey, bytes) {
	return crypto.subtle.sign(authAlgorithm, privCryptoKey, bytes)
}

export async function verify(pubCryptoKey, signature, bytes) {
	return crypto.subtle.verify(authAlgorithm, pubCryptoKey, signature, bytes)
}