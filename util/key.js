const sigKeyParams = {
	name: "ECDSA",
	namedCurve: "P-384"
}

export async function genKeyPair() {
	return crypto.subtle.generateKey(sigKeyParams, true, ["sign", "verify"])
}

export async function exportKey(cryptoKey) {
	return crypto.subtle.exportKey("jwk", cryptoKey)
}

export async function importKey(jwk, keyUsages) {
	return crypto.subtle.importKey("jwk", jwk, sigKeyParams, true, keyUsages)
}

export function getJwkBytes(jwk) {
	const str = JSON.stringify(jwk)
	return new TextEncoder().encode(str)
}