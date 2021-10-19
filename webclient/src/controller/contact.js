
import { base64ToBytes, bytesToBase64 } from "../../../util/base64";
import { hash } from "../../../util/hash";

const contactsStorageKey = "contacts"

export class ContactController {
	host;

	list = []
	selected = {}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.init()
	}

	init() {
		const stored = localStorage.getItem(contactsStorageKey)
		if (stored) {
			this.list = JSON.parse(stored)
			this.select(this.list[0])
		}
		this.host.requestUpdate()
	}

	store() {
		localStorage.setItem(contactsStorageKey, JSON.stringify(this.list))
	}

	async addContact(contact) {
		if (this.isValid(contact)) {
			const publicKeyRaw = base64ToBytes(contact.keys.auth.base64)
			const publicKeyHash = new Uint8Array(await hash(publicKeyRaw))
    	contact.keys.auth.publicKeyHash = bytesToBase64(publicKeyHash)
			const existing = this.list.find(c => this.matches(c, contact))
			if (existing) {
				Object.assign(existing, contact)
			} else {
				this.list.push(contact)
			}
			this.store()
			this.select(contact)
			this.host.requestUpdate()
		}
	}

	async addContactFromShareable(shareable) {
    if (!shareable || shareable.length < 1) {
      console.log("Invalid shareable")
      return false
    }
		let contact = {}
		try {
    	const jsonString = new TextDecoder().decode(base64ToBytes(shareable))
      contact = JSON.parse(jsonString).contact;
    } catch (e) {
      console.log("Failed to parse json")
      return false
    }
    if (!this.isValid(contact)) {
      console.log("Failed, missing keys, domain or name", contact)
      return false
    }
    await this.addContact(contact)
    this.host.requestUpdate();
		return true;
	}

	remove(contact) {
		const index = this.list.findIndex(c => this.matches(c, contact))
		if (index > -1) {
			this.list.splice(index, 1)
			this.selected = undefined
			this.store()
			this.host.message.list = this.host.message.list.filter(m => m.f !== contact.keys.auth.publicKeyHash)
			this.host.message.store()
			console.log("Contact removed")
			this.host.requestUpdate()
		} else {
			console.log("Contact not found")
		}
	}

	select(contact) {
		this.selected = contact
    console.log("Contact selected", this.selected)
		this.host.requestUpdate()
	}

	isValid(contact) {
		return contact && contact.name && contact.domain
				&& contact.keys && contact.keys.auth && contact.keys.dh
	}

	matches(contact1, contact2) {
		return contact1.keys.auth.publicKeyHash === contact2.keys.auth.publicKeyHash
	}
}