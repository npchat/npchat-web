import { hash } from "../../../util/hash";
import { authKeyParams, dhKeyParams, genAuthKeyPair, genDHKeyPair, getBytesFromPrivateCryptoKey, getPrivateCryptoKeyFromBytes, importAuthKey, importDHKey } from "../../../util/key";
import { buildShareable } from "../util/shareable";
import { generateQR } from "../util/qrcode";
import { base64ToBytes, bytesToBase64 } from "../../../util/base64";

const nameStorageKey = "name"
const originStorageKey = "origin"
const keysStorageKey = "keys"
const welcomeDismissedStorageKey = "welcomeDismissed"
const defaultOrigin = "https://npchat.dr-useless.workers.dev"

export class PreferenceController {
	host;
	keys = {}
	qrCodeShareable = {}
	exportLink = {}
	exportQRCode = {}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.origin = localStorage.getItem(originStorageKey) || defaultOrigin
		this.name = localStorage.getItem(nameStorageKey) || "Anonymous"
		this.welcomeDismissed = localStorage.getItem(welcomeDismissedStorageKey) || false
	}

	async init() {
		await this.getKeys(true)
		await this.initShareables()
		await this.initExport()
		this.store()
		this.host.requestUpdate()
	}

	async getKeys(tryAgain) {
		try {
			const stored = localStorage.getItem(keysStorageKey)
			if (!stored) {
				this.keys = {
					auth: {
						keyPair: await genAuthKeyPair()
					},
					dh: {
						keyPair: await genDHKeyPair()
					}
				}
				this.keys.auth.raw = {
					publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", this.keys.auth.keyPair.publicKey)),
					privateKey: await getBytesFromPrivateCryptoKey(this.keys.auth.keyPair.privateKey)
				}
				this.keys.auth.base64 = {
					publicKey: bytesToBase64(this.keys.auth.raw.publicKey),
					privateKey: bytesToBase64(this.keys.auth.raw.privateKey)
				}
				this.keys.auth.publicKeyHash = bytesToBase64(new Uint8Array(await hash(this.keys.auth.raw.publicKey)))
				this.keys.dh.raw = {
					publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", this.keys.dh.keyPair.publicKey)),
					privateKey: await getBytesFromPrivateCryptoKey(this.keys.dh.keyPair.privateKey)
				}
				this.keys.dh.base64 = {
					publicKey: bytesToBase64(this.keys.dh.raw.publicKey),
					privateKey: bytesToBase64(this.keys.dh.raw.privateKey)
				}
				this.store()
				console.log("Generated fresh ECDSA P-256 & ECDH P-256 key pairs")
				return this.keys
			}
			this.keys = JSON.parse(stored)
			this.keys.auth.raw = {
				publicKey: base64ToBytes(this.keys.auth.base64.publicKey),
				privateKey: base64ToBytes(this.keys.auth.base64.privateKey)
			}
			this.keys.auth.keyPair = {
				publicKey: await importAuthKey("raw", this.keys.auth.raw.publicKey, ["verify"]),
				privateKey: await getPrivateCryptoKeyFromBytes(this.keys.auth.raw.privateKey, authKeyParams, ["sign"])
			}
			this.keys.auth.publicKeyHash = bytesToBase64(new Uint8Array(await hash(this.keys.auth.raw.publicKey)))
			this.keys.dh.raw = {
				publicKey: base64ToBytes(this.keys.dh.base64.publicKey),
				privateKey: base64ToBytes(this.keys.dh.base64.privateKey)
			}
			this.keys.dh.keyPair = {
				publicKey: await importDHKey("raw", this.keys.dh.raw.publicKey, []),
				privateKey: await getPrivateCryptoKeyFromBytes(this.keys.dh.raw.privateKey, dhKeyParams, ["deriveKey", "deriveBits"])
			}
			return this.keys
		} catch (e) {
			console.log("getKeys failed", e)
			localStorage.removeItem(keysStorageKey)
			if (tryAgain) await this.getKeys(false)
		}
	}

	async initShareables() {
		this.shareable = this.getShareable()
		this.shareableLink = this.getShareableLink(this.shareable)
		this.qrCodeShareable = await this.getQRCodeAsDataUrl(this.shareableLink)
	}

	async initExport() {
		this.exportLink = `${window.location.origin}#${this.getExportString()}`
		this.exportQRCode = await this.getQRCodeAsDataUrl(this.exportLink)
	}

	getExportString() {
		const data = {
			keys: {
				auth: {
					base64: this.keys.auth.base64
				},
				dh: {
					base64: this.keys.dh.base64
				}
			},
			name: this.name,
			origin: this.origin,
			contacts: this.host.contact.list
		}
		const bytes = new TextEncoder().encode(JSON.stringify(data))
		return bytesToBase64(bytes)
	}

	getShareable() {
		const shareable = buildShareable(this.name, this.origin, this.keys.auth.base64.publicKey, this.keys.dh.base64.publicKey)
		const bytes = new TextEncoder().encode(JSON.stringify(shareable))
		return bytesToBase64(bytes)
	}

	async getQRCodeAsDataUrl(link) {
		return await generateQR(link, { errorCorrectionLevel: "L" })
	}

	getShareableLink(shareable) {
		return `${window.location.origin}#${shareable}`
	}

	store() {
		localStorage.setItem(nameStorageKey, this.name)
		localStorage.setItem(originStorageKey, this.origin)
		const keysToStore = {
			auth: { base64: this.keys.auth.base64 },
			dh: { base64: this.keys.dh.base64 }
		}
		localStorage.setItem(keysStorageKey, JSON.stringify(keysToStore))
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
		this.host.requestUpdate()
	}

	async changeOrigin(origin) {
		origin = origin.trim()
		if (origin.length > 0) {
			this.origin = origin
		} else {
			this.origin = defaultOrigin
		}
		return this.init()
	}

	dismissWelcome() {
		this.welcomeDismissed = true
		localStorage.setItem(welcomeDismissedStorageKey, "true")
		this.host.requestUpdate()
	}
}