export const sigAlgorithm = {
	name: "ECDSA",
	hash: "SHA-384"
}

export async function sign(privCryptoKey, bytes) {
	return crypto.subtle.sign(sigAlgorithm, privCryptoKey, bytes)
}

export async function verify(pubCryptoKey, signature, bytes) {
	return crypto.subtle.verify(sigAlgorithm, pubCryptoKey, signature, bytes)
}