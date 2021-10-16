import { base58 } from "../../../util/base58";
import { hash } from "../../../util/hash";
import { getJwkBytes } from "../../../util/key";

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
			const publicHashBytes = new Uint8Array(await hash(getJwkBytes(contact.keys.auth.jwk)))
    	contact.keys.auth.publicHash = base58().encode(publicHashBytes)
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
    const bytes = base58().decode(shareable)
    const jsonString = new TextDecoder().decode(bytes)
    let contact = {}
    try {
      contact = JSON.parse(jsonString).contact;
    } catch (e) {
      console.log("Failed to parse json", jsonString)
      return
    }
    if (!this.isValid(contact)) {
      console.log("Failed, missing keys, domain or name", contact)
      return
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
			this.host.message.list = this.host.message.list.filter(m => m.f !== contact.keys.auth.publicHash)
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
		return contact && contact.keys && contact.keys.auth && contact.keys.auth.jwk
			&& contact.name && contact.domain
	}

	matches(contact1, contact2) {
		return contact1.keys.auth.publicHash === contact2.keys.auth.publicHash
	}
}