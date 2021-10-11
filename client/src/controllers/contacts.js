import { base58 } from '../../../util/base58';
import { hash } from '../../../util/hash';
import { getJwkBytes } from '../../../util/key';

const contactsStorageKey = "contacts"

export class ContactsController {
	host;

	constructor(host) {
		this.host = host
		host.addController(this)
		this.list = []
		this.selected = {}
		const stored = localStorage.getItem(contactsStorageKey)
		if (stored) {
			this.list = JSON.parse(stored)
			this.selectContact(this.list[0])
		}
		this.addFromUrlHash()
		this.host.requestUpdate()
	}

	async addFromUrlHash() {
		const h = window.location.hash.replace('#','')
		if (h.length > 0) {
			window.history.pushState({},"", window.location.origin)
			await this.addContactFromShareable(h);
		}
	}

	store() {
		localStorage.setItem(contactsStorageKey, JSON.stringify(this.list))
		console.log('stored contacts')
	}

	addContact(contact) {
		if (this.isValid(contact)) {
			const existing = this.list.find(c => this.matches(c, contact))
			if (existing) {
				Object.assign(existing, contact)
			} else {
				this.list.push(contact)
			}
			this.store()
			this.selectContact(contact)
			this.host.requestUpdate()
		}
	}

	async addContactFromShareable(shareable) {
    if (!shareable || shareable.length < 1) {
      console.log("invalid")
      return false
    }
    const bytes = base58().decode(shareable)
    const jsonString = new TextDecoder().decode(bytes)
    let contact = {}
    try {
      contact = JSON.parse(jsonString);
    } catch (e) {
      console.log("failed to parse json", jsonString)
      return
    }
    if (!this.isValid(contact)) {
      console.log("failed, missing keys, inboxDomain or name", contact)
      return
    }
    const publicHashBytes = new Uint8Array(await hash(getJwkBytes(contact.keys.sig.jwk)))
    contact.keys.sig.publicHash = base58().encode(publicHashBytes)
    this.addContact(contact)
    this.host.requestUpdate();
		return true;
	}

	removeContact(contact) {
		const index = this.list.findIndex(c => this.matches(c, contact))
		if (this.index >= 0) {
			this.list = this.list.splice(index, 1);
			console.log('removed')
		} else {
			console.log('not found')
		}
	}

	selectContact(contact) {
		this.selected = contact
    console.log('selected', this.selected)
		this.host.requestUpdate()
	}

	isValid(contact) {
		return contact && contact.keys && contact.keys.sig && contact.keys.sig.jwk
			&& contact.name && contact.inboxDomain
	}

	matches(contact1, contact2) {
		return contact1.keys.sig.publicHash === contact2.keys.sig.publicHash
	}
}