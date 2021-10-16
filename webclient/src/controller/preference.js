import { base58 } from "../../../util/base58";
import { hash } from "../../../util/hash";
import { deriveKey, exportKey, genAuthKeyPair, genDHKeyPair, getJwkBytes, importAuthKey, importDHKey } from "../../../util/key";
import { buildShareable } from "../util/shareable";
import { generateQR } from "../util/qrcode";

const nameStorageKey = "name"
const domainStorageKey = "domain"
const keysStorageKey = "keys"
const welcomeDismissedStorageKey = "welcomeDismissed"
const defaultDomain = "npchat.dr-useless.workers.dev"

const domainRegex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/

export class PreferenceController {
	host;
	keys = {}
	qrCodeShareable = {}
	exportLink = {}
	exportQRCode = {}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.domain = localStorage.getItem(domainStorageKey) || defaultDomain
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
				auth: {
					keyPair: await genAuthKeyPair()
				},
				dh: {
					keyPair: await genDHKeyPair()
				}
			}
      this.keys.auth.jwk = {
				public: await exportKey(this.keys.auth.keyPair.publicKey),
				private: await exportKey(this.keys.auth.keyPair.privateKey)
			}
			this.keys.dh.jwk = {
				public: await exportKey(this.keys.dh.keyPair.publicKey),
				private: await exportKey(this.keys.dh.keyPair.privateKey)
			}
      const hashBytes = new Uint8Array(await hash(getJwkBytes(this.keys.auth.jwk.public)))
      this.keys.auth.publicHash = base58().encode(hashBytes)
			localStorage.setItem(keysStorageKey, JSON.stringify(this.keys))
			return
    } 
		const storedKeys = JSON.parse(stored)
		this.keys = storedKeys
		this.keys.auth.keyPair = {
			privateKey: await importAuthKey(this.keys.auth.jwk.private, ["sign"]),
			publicKey: await importAuthKey(this.keys.auth.jwk.public, ["verify"])
		}
		this.keys.dh.keyPair = {
			privateKey: await importDHKey(this.keys.dh.jwk.private, ["deriveKey"]),
			publicKey: await importDHKey(this.keys.dh.jwk.public, [])
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
				auth: {
					jwk: {
						public: this.keys.auth.jwk.public,
						private: this.keys.auth.jwk.private
					},
					publicHash: this.keys.auth.publicHash
				},
				dh: {
					public: this.keys.dh.jwk.public,
					private: this.keys.dh.jwk.private
				}
			},
			name: this.name,
			domain: this.domain,
			contacts: this.host.contact.list
		}
		const bytes = new TextEncoder().encode(JSON.stringify(data))
		return base58().encode(bytes)
	}

	getShareable() {
		const shareable = buildShareable(this.name, this.keys.auth.jwk.public, this.keys.dh.jwk.public, this.domain)
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
		localStorage.setItem(domainStorageKey, this.domain)
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

	async changeDomain(domain) {
		if (domain.trim().length > 0 && domainRegex.test(domain)) {
			this.domain = domain
		} else {
			this.domain = defaultDomain
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