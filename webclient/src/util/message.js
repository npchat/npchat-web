import { sign, verify } from "../../../util/auth"
import { base64ToBytes, bytesToBase64 } from "../../../util/base64"
import { hash } from "../../../util/hash"
import { deriveDHSecret, importDHKey } from "../../../util/key"
import { encrypt, getIV } from "../../../util/privacy"

export async function buildMessage(authPriv, dhPrivateKey, messageText, from, toDHBase64) {
	const t = Date.now()
	const iv = await getIV(from+t)
	const ivBytes = new Uint8Array(iv)
	const toDHRaw = base64ToBytes(toDHBase64)
	const dhPublicKey = await importDHKey("raw", toDHRaw, [])
	const derivedKey = await deriveDHSecret(dhPublicKey, dhPrivateKey)
	const encrypted = await encrypt(iv, derivedKey, new TextEncoder().encode(messageText))
	const encryptedBytes = new Uint8Array(encrypted)
	const associatedBytes = new TextEncoder().encode(JSON.stringify({t: t, f: from}))
	const bytesToHash = new Uint8Array([...ivBytes, ...encryptedBytes, ...associatedBytes])
	const messageHash = new Uint8Array(await hash(bytesToHash))
	const message = {
		t: t,
		iv: bytesToBase64(ivBytes),
		m: bytesToBase64(encryptedBytes),
		f: from,
		h: bytesToBase64(messageHash)
	}
	const hashSig = new Uint8Array(await sign(authPriv, messageHash))
	message.s = bytesToBase64(hashSig)
	return message
}

export async function sendMessage(domain, toPublicKeyHash, builtMessage) {
	const resp = await fetch(`${location.protocol}//${domain}/${toPublicKeyHash}`, {
		method: "POST",
		body: JSON.stringify(builtMessage)
	})
	return resp.json()
}

export async function verifyMessage(authPub, message) {
	if (!message.t || !message.iv || !message.m || !message.f || !message.h) {
		return false
	}
	const iv = base64ToBytes(message.iv)
	const	m = base64ToBytes(message.m)
	const associatedBytes = new TextEncoder().encode(JSON.stringify({t: message.t, f: message.f}))
	const bytesToHash = new Uint8Array([...iv, ...m, ...associatedBytes])
	const hashed = new Uint8Array(await hash(bytesToHash))
	if (!bytesToBase64(hashed) === message.h) {
		return false
	}
	return await verify(authPub, base64ToBytes(message.s), hashed)
}

