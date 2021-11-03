import { hash } from "./hash"

export const aesMode = "AES-GCM"

export const aesKeyParams = {
	name: aesMode,
	length: 256
}

export async function encrypt(iv, key, data) {
	return crypto.subtle.encrypt({name: aesMode, iv: iv}, key, data)
}

export async function decrypt(iv, key, data) {
	return crypto.subtle.decrypt({name: aesMode, iv: iv}, key, data)
}

export async function getIV(text) {
	let random = new Uint8Array(32)
	crypto.getRandomValues(random)
	const textBytes = new TextEncoder().encode(text)
	return hash(new Uint8Array([...random, ...textBytes]))
}