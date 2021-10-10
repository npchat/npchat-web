import { base58 } from './base58'
import { getJwkBytes } from './key'

export const messagesKey = "messages"

export async function fetchMessages(host, sigPubJwk, sigPubJwkHash, challengeSig) {
	const sigPubJwkBytes = getJwkBytes(sigPubJwk)
	const sigPubJwkBase58 = base58().encode(sigPubJwkBytes)
	const resp = await fetch(`https://${host}/${sigPubJwkHash}`, {
		headers: {
			"oc-pk": sigPubJwkBase58,
			"oc-sig": challengeSig
		}
	})
	return (await resp.json()).messages
}

export function buildMessage(message, to, from) {
	return {
		m: message,
		from: from,
		to: to
	}
}

export async function sendMessage(host, toSigPubJwkHash, fromSigPubJwkHash, message) {
	const resp = await fetch(`https://${host}/${toSigPubJwkHash}`, {
		method: "POST",
		body: JSON.stringify(buildMessage(message, undefined, fromSigPubJwkHash))
	})
	return resp.json()
}