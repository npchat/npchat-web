import { base58 } from './base58'
import { sign } from './sign'

export const challengeKey = "challenge"

export async function fetchChallenge(domain, sigPubJwkHash) {
	try {
		const resp = await fetch(`https://${domain}/${sigPubJwkHash}/challenge`)
		return resp.json()
	} catch (e) {
		console.log("failed to fetch challenge", e)
		return null
	}
}

export function hasChallengeExpired(challenge) {
	if (!challenge || !challenge.exp) {
		return true
	}
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