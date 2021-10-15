import { base58 } from "./base58"
import { sign } from "./sign"

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