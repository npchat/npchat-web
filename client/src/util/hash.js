const hashAlgorithm = "SHA-256"

export async function hash(bytes) {
	return crypto.subtle.digest(hashAlgorithm, bytes)
}