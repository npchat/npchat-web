import { sign, verify } from "../../../util/auth"
import { base58 } from "../../../util/base58"
import { hash } from "../../../util/hash"
import { deriveKey, importDHKey } from "../../../util/key"
import { encrypt, getIV } from "../../../util/privacy"

export async function buildMessage(authPriv, dhPrivateKey, messageText, from, toDHPublicJwk) {
	const t = Date.now()
	const iv = await getIV(from+t)
	const ivBytes = new Uint8Array(iv)
	const dhPublicKey = await importDHKey(toDHPublicJwk, [])
	const derivedKey = await deriveKey(dhPublicKey, dhPrivateKey)
	const encrypted = await encrypt(iv, derivedKey, new TextEncoder().encode(messageText))
	const encryptedBytes = new Uint8Array(encrypted)
	const associatedBytes = new TextEncoder().encode(JSON.stringify({t: t, f: from}))
	const bytesToHash = new Uint8Array([...ivBytes, ...encryptedBytes, ...associatedBytes])
	const messageHash = new Uint8Array(await hash(bytesToHash))
	const b58 = base58()
	const message = {
		t: t,
		iv: b58.encode(ivBytes),
		m: b58.encode(encryptedBytes),
		f: from,
		h: b58.encode(messageHash)
	}
	const hashSig = new Uint8Array(await sign(authPriv, messageHash))
	message.s = b58.encode(hashSig)
	return message
}

export async function sendMessage(domain, toPublicKeyHash, builtMessage) {
	const resp = await fetch(`https://${domain}/${toPublicKeyHash}`, {
		method: "POST",
		body: JSON.stringify(builtMessage)
	})
	return resp.json()
}

export async function verifyMessage(authPub, message) {
	if (!message.t || !message.iv || !message.m || !message.f || !message.h) {
		return false
	}
	const b58 = base58()
	const iv = b58.decode(message.iv)
	const	m = b58.decode(message.m)
	const associatedBytes = new TextEncoder().encode(JSON.stringify({t: message.t, f: message.f}))
	const bytesToHash = new Uint8Array([...iv, ...m, ...associatedBytes])
	const hashed = new Uint8Array(await hash(bytesToHash))
	if (!b58.encode(hashed) === message.h) {
		return false
	}
	return await verify(authPub, b58.decode(message.s), hashed)
}

