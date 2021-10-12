import { challengeKey, fetchChallenge, hasChallengeExpired, signChallenge } from '../../../util/auth';

export class AuthController {
	host;
	challenge = {}

	constructor(host) {
		this.host = host
		host.addController(this)
	}

	async init() {
		this.challenge = null
		this.challenge = await this.getChallenge()
		return this.challenge.exp
	}

	async getChallenge() {
		if (this.challenge && !hasChallengeExpired(this.challenge)) {
			return this.challenge
		}
		const stored = sessionStorage.getItem(challengeKey)
		if (stored) {
			const parsed = JSON.parse(stored)
			if (!hasChallengeExpired(parsed)) {
				return parsed
			}
		}
		return await fetchChallenge(this.host.pref.inboxDomain, this.host.pref.keys.sig.publicHash)
	}

	async getChallengeSig() {
		this.challenge = await this.getChallenge()
		return await signChallenge(this.host.pref.keys.sig.keyPair.privateKey, this.challenge.txt)
	}


}