import { base58 } from '../../../util/base58';
import { hash } from '../../../util/hash';
import { exportKey, genKeyPair, getJwkBytes, importKey } from '../../../util/key';
import { buildShareable } from '../../../util/shareable';
import { generateQR } from '../util/qrcode';

const nameStorageKey = "name"
const inboxDomainStorageKey = "inboxDomain"
const keysStorageKey = "keys"
const acceptOnlyVerifiedStorageKey = "acceptOnlyVerified"
const shareablesDismissedStorageKey = "shareablesDismissed"

const inboxDomainRegex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/

export class PreferencesController {
	host;

	constructor(host) {
		this.host = host
		host.addController(this)
		this.keys = {
			sig: {
				publicHash: ""
			},
			enc: {
			}
		}
		this.qrCode = {}
		this.initPromise = this.getKeys().then(() => {
			this.shareablesDismissed = localStorage.getItem(shareablesDismissedStorageKey) || false
			this.name = localStorage.getItem(nameStorageKey) || "Anonymous"
			this.inboxDomain = localStorage.getItem(inboxDomainStorageKey) || "openchat.dr-useless.workers.dev"
			const storedAcceptOnlyVerified = localStorage.getItem(acceptOnlyVerifiedStorageKey)
			this.acceptOnlyVerified = !(storedAcceptOnlyVerified && storedAcceptOnlyVerified === "false") || false
			this.initShareables()
			this.store()
			this.host.requestUpdate()
		})
	}


	async getKeys() {
    const stored = localStorage.getItem(keysStorageKey)
    if (!stored) {
			// generate keys
      this.keys = {
				sig: {
					keyPair: await genKeyPair()
				},
				enc: {
				}
			}
      this.keys.sig.jwk = {
				private: await exportKey(this.keys.sig.keyPair.privateKey),
				public: await exportKey(this.keys.sig.keyPair.publicKey)
			}
      const hashBytes = new Uint8Array(await hash(getJwkBytes(this.keys.sig.jwk.public)))
      this.keys.sig.publicHash = base58().encode(hashBytes)
			localStorage.setItem(keysStorageKey, this.keys)
			return
    } 
		const storedKeys = JSON.parse(stored)
		this.keys = storedKeys
		this.keys.sig.keyPair = {
			privateKey: await importKey(this.keys.sig.jwk.private, ["sign"]),
			publicKey: await importKey(this.keys.sig.jwk.public, ["verify"])
		}
		return this.keys
  }

	async initShareables() {
		this.shareable = this.getShareable()
		this.qrCode = await this.getShareableQR(this.shareable)
	}

	getShareable() {
		const sig = this.keys.sig
		const shareable = buildShareable(this.name, sig.jwk.public, this.inboxDomain)
		const bytes = new TextEncoder().encode(JSON.stringify(shareable))
    return base58().encode(bytes)
  }

	async getShareableQR(shareable) {
		const link = `https://${window.location.host}#${shareable}`
		return await generateQR(link)
	}

	store() {
		localStorage.setItem(nameStorageKey, this.name)
		localStorage.setItem(inboxDomainStorageKey, this.inboxDomain)
		localStorage.setItem(keysStorageKey, JSON.stringify(this.keys))
		localStorage.setItem(acceptOnlyVerifiedStorageKey, this.acceptOnlyVerified)
		localStorage.setItem(shareablesDismissedStorageKey, this.shareablesDismissed)
	}

	async changeName(name) {
		if (name && name.trim().length > 0) {
			this.name = name.trim()
		} else {
			this.name = "Anonymous"
		}
		await initShareables()
		this.store()
		this.host.requestUpdate()
	}

	async changeInboxDomain(inboxDomain) {
		if (inboxDomain && inboxDomainRegex.test(inboxDomain)) {
			this.inboxDomain = inboxDomain
			await this.initShareables()
			this.store()
			this.host.requestUpdate()
		} else {
			console.log('invalid domain')
		}
	}

	changeAcceptOnlyVerified(acceptOnlyVerified) {
		this.acceptOnlyVerified = acceptOnlyVerified
		console.log('changed to', this.acceptOnlyVerified)
		this.store()
		this.host.requestUpdate()
	}

	dismissShareables() {
		this.shareablesDismissed = true
		this.host.requestUpdate()
		this.store()
	}
}