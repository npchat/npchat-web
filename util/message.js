import { base58 } from './base58'
import { hash } from './hash'
import { getJwkBytes } from './key'
import { sign, verify } from './sign'

export const messagesKey = "messages"

export async function fetchMessages(domain, sigPubJwk, sigPubJwkHash, challengeSig) {
	const sigPubJwkBytes = getJwkBytes(sigPubJwk)
	const sigPubJwkBase58 = base58().encode(sigPubJwkBytes)
	const resp = await fetch(`https://${domain}/${sigPubJwkHash}`, {
		headers: {
			"oc-pk": sigPubJwkBase58,
			"oc-sig": challengeSig
		}
	})
	return (await resp.json()).messages
}

export async function buildMessage(sigPriv, messageText, from, to) {
	const message = {
		t: Date.now(),
		m: messageText,
		from: from,
	}
	const bytes = new TextEncoder().encode(JSON.stringify(message))
	const hashBytes = new Uint8Array(await hash(bytes))
	const b58 = base58()
	message.h = b58.encode(hashBytes)
	if (sigPriv) {
		const hashSig = new Uint8Array(await sign(sigPriv, hashBytes))
		message.sig = b58.encode(hashSig)
	}
	message.to = to
	return message
}

export async function sendMessage(domain, sigPriv, message, from, to) {
	const resp = await fetch(`https://${domain}/${to}`, {
		method: "POST",
		body: JSON.stringify(await buildMessage(sigPriv, message, from, undefined))
	})
	return resp.json()
}

export async function verifyMessage(sigPub, message) {
	if (!message.h || !message.sig) {
		console.log("cannot verify message, missing h or sig", message)
		return false
	}
	const hashable = {
		t: message.t,
		m: message.m,
		from: message.from
	}
	const bytes = new TextEncoder().encode(JSON.stringify(hashable))
	const hashBytes = new Uint8Array(await hash(bytes))
	const b58 = base58()
	const hashedMessage = b58.encode(hashBytes)
	if (hashedMessage !== message.h) {
		return false
	}
	const sigBytes = b58.decode(message.sig)
	const isVerified = await verify(sigPub, sigBytes, hashBytes)
	if (!isVerified) {
		return false
	}
	return true
}