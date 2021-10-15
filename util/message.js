import { base58 } from "./base58"
import { hash } from "./hash"
import { sign, verify } from "./sign"

export const messagesKey = "messages"

export async function buildMessage(sigPriv, messageText, from) {
	const hashable = buildMessageBody(messageText, from)
	const bytes = new TextEncoder().encode(JSON.stringify(hashable))
	const hashBytes = new Uint8Array(await hash(bytes))
	const b58 = base58()
	hashable.h = b58.encode(hashBytes)
	if (sigPriv) {
		const hashSig = new Uint8Array(await sign(sigPriv, hashBytes))
		hashable.s = b58.encode(hashSig)
	}
	return hashable
}

function buildMessageBody(messageText, from, time) {
	return {
		t: time || Date.now(),
		m: messageText,
		f: from
	}
}

export async function sendMessage(domain, sigPriv, message, from, to) {
	const resp = await fetch(`https://${domain}/${to}`, {
		method: "POST",
		body: JSON.stringify(await buildMessage(sigPriv, message, from))
	})
	return resp.json()
}

export async function verifyMessage(sigPub, message) {
	if (!message.h || !message.s) {
		return false
	}
	const hashable = buildMessageBody(message.m, message.f, message.t)
	const bytes = new TextEncoder().encode(JSON.stringify(hashable))
	const hashBytes = new Uint8Array(await hash(bytes))
	const b58 = base58()
	const hashedMessage = b58.encode(hashBytes)
	if (hashedMessage !== message.h) {
		return false
	}
	const sigBytes = b58.decode(message.s)
	const isVerified = await verify(sigPub, sigBytes, hashBytes)
	if (!isVerified) {
		return false
	}
	return true
}

