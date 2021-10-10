import { base58 } from './base58'
import { sign } from './sign'

export async function fetchChallenge(host, sigPubJwkHash) {
	const resp = await fetch(`https://${host}/${sigPubJwkHash}/challenge`)
	return resp.json()
}

export function hasChallengeExpired(challenge) {
	// check expiry (not t) to prevent issue when changing challengeTtl
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