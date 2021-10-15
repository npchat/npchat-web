import { base58 } from "../../../util/base58";
import { hash } from "../../../util/hash";
import { exportKey, genKeyPair, getJwkBytes, importKey } from "../../../util/key";
import { buildShareable } from "../util/shareable";
import { generateQR } from "../util/qrcode";

const nameStorageKey = "name"
const inboxDomainStorageKey = "inboxDomain"
const keysStorageKey = "keys"
const welcomeDismissedStorageKey = "welcomeDismissed"
const defaultDomain = "npchat.dr-useless.workers.dev"

const inboxDomainRegex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/

export class PreferenceController {
	host;
	keys = {}
	qrCodeShareable = {}
	exportLink = {}
	exportQRCode = {}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.inboxDomain = localStorage.getItem(inboxDomainStorageKey) || defaultDomain
		this.name = localStorage.getItem(nameStorageKey) || "Anonymous"
		this.welcomeDismissed = localStorage.getItem(welcomeDismissedStorageKey) || false
	}

	async init() {
		await this.getKeys()
		await this.initShareables()
		await this.initExport()
		this.store()
		this.host.requestUpdate()
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
			localStorage.setItem(keysStorageKey, JSON.stringify(this.keys))
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
		this.shareableLink = this.getShareableLink(this.shareable)
		this.qrCodeShareable = await this.getQRCodeAsDataUrl(this.shareableLink)
	}

	async initExport() {
		this.exportLink = `https://${window.location.host}#${this.getExportBase58()}`
		this.exportQRCode = await this.getQRCodeAsDataUrl(this.exportLink)
	}

	getExportBase58() {
		const data = {
			keys: {
				sig: {
					jwk: {
						public: this.keys.sig.jwk.public,
						private: this.keys.sig.jwk.private
					},
					publicHash: this.keys.sig.publicHash
				}
			},
			name: this.name,
			inboxDomain: this.inboxDomain,
			contacts: this.host.contact.list
		}
		const bytes = new TextEncoder().encode(JSON.stringify(data))
		return base58().encode(bytes)
	}

	getShareable() {
		const sig = this.keys.sig
		const shareable = buildShareable(this.name, sig.jwk.public, this.inboxDomain)
		const bytes = new TextEncoder().encode(JSON.stringify(shareable))
    return base58().encode(bytes)
  }

	async getQRCodeAsDataUrl(link) {
		return await generateQR(link, {errorCorrectionLevel: "L"})
	}

	getShareableLink(shareable) {
		return `https://${window.location.host}#${shareable}`
	}

	store() {
		localStorage.setItem(nameStorageKey, this.name)
		localStorage.setItem(inboxDomainStorageKey, this.inboxDomain)
		localStorage.setItem(keysStorageKey, JSON.stringify(this.keys))
		localStorage.setItem(keysStorageKey, JSON.stringify(this.keys))
	}

	async changeName(name, enforceNotBlank) {
		if (enforceNotBlank) {
			if (name && name.trim().length > 0) {
				this.name = name.trim()
			} else {
				this.name = "Anonymous"
			}
		} else {
			this.name = name.trim()
		}
		await this.init()
		this.store()
		this.host.requestUpdate()
	}

	async changeInboxDomain(inboxDomain) {
		if (inboxDomain.trim().length > 0 && inboxDomainRegex.test(inboxDomain)) {
			this.inboxDomain = inboxDomain
		} else {
			this.inboxDomain = defaultDomain
		}
		await this.init()
		this.store()
	}

	dismissWelcome() {
		this.welcomeDismissed = true
		localStorage.setItem(welcomeDismissedStorageKey, "true")
		this.host.requestUpdate()
	}
}