import {LitElement, html, css} from 'lit';
import { base58 } from '../util/base58';
import { hash } from '../util/hash';
import { exportKey, genKeyPair, getJwkBytes, importKey } from '../util/key';

export class Client extends LitElement {
  static properties = {
    sharable: {},
    name: {},
    sigKeyPair: {},
    sigPrivJwk: {},
    sigPubJwk: {},
    sigPubJwkHash: {},
    challenge: {},
    selectedContact: {},
    contacts: {},
    messages: {}
  }

  static styles = css`
    li {
      font-size: 1.2rem;
    }
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
    input {
      font-size: 1.2rem;
    }
    button {
      padding: 0.25rem;
      font-size: 1rem;
    }
    .sharable {
      background-color: #e5e5e5;
      max-width: 600px;
      display: block;
      padding: 0.5rem;
    }
    .wrap {
      overflow-wrap: anywhere;
    }
    .contact-list {
      list-style: none;
      padding: 0
    }
    .contact:hover {
      background-color: #e5e5e5;
    }
  `;

  constructor() {
    super()
    this.sharable = {}
    this.name = ""
    this.sigKeyPair = {}
    this.sigPrivJwk = {}
    this.sigPubJwk = {}
    this.sigPubJwkHash = {}
    this.challenge = {}
    this.selectedContact = {}
    this.contacts = []
    this.messages = []
  }

  connectedCallback() {
    super.connectedCallback()
    this.initContacts()
    this.initMessages()
    this.initKeys()
    .then(() => this.initSharable())
    .then(() => console.log('init done'))
  }

  async initKeys() {
    const storedSigPrivJwk = localStorage.getItem("sigPrivJwk")
    const storedSigPubJwk = localStorage.getItem("sigPubJwk")
    const storedSigPubJwkHash = localStorage.getItem("sigPubJwkHash")
    if (!storedSigPrivJwk || !storedSigPubJwk || !storedSigPubJwkHash) {
      this.sigKeyPair = await genKeyPair()
      this.sigPrivJwk = await exportKey(this.sigKeyPair.privateKey)
      this.sigPubJwk = await exportKey(this.sigKeyPair.publicKey)
      localStorage.setItem("sigPrivJwk", JSON.stringify(this.sigPrivJwk))
      localStorage.setItem("sigPubJwk", JSON.stringify(this.sigPubJwk))
      const hashBytes = new Uint8Array(await hash(getJwkBytes(this.sigPubJwk)))
      this.sigPubJwkHash = base58().encode(hashBytes)
      localStorage.setItem("sigPubJwkHash", this.sigPubJwkHash)
    } else {
      this.sigPrivJwk = JSON.parse(storedSigPrivJwk)
      this.sigPubJwk = JSON.parse(storedSigPubJwk)
      this.sigPubJwkHash = storedSigPubJwkHash
      this.sigKeyPair = {
        privateKey: await importKey(this.sigPrivJwk, ["sign"]),
        publicKey: await importKey(this.sigPubJwk, ["verify"])
      }
    }
    console.log('initKeys done', this.sigKeyPair, this.sigPubJwkHash)
  }

  initSharable() {
    this.name = localStorage.getItem("name")
    if (!this.name) {
      // ask user to input a name
      this.name = "Joey"
    }
    const sharable = {
      name: this.name,
      sigPubJwk: this.sigPubJwk
    }
    
    this.sharable = btoa(JSON.stringify(sharable))
    console.log('initSharable done')

  }

  initContacts() {
    const stored = localStorage.getItem("contacts")
    if (!stored) {
      this.contacts = []
      return
    }
    this.contacts = JSON.parse(stored)
  }

  initMessages() {
    const stored = localStorage.getItem("messages")
    if (!stored) {
      this.messages = []
      return
    }
    this.messages = JSON.parse(stored)
  }

  render() {
    let messages = this.messages
    if (this.selectedContact) {
      messages = messages.filter(m => m.from === this.selectedContact.sigPubJwkHash)
    }
     
    return html`
      <header>
        <h1>Openchat client</h1>
        <div>
        <h2>Hello, ${this.name}</h2>
        <h3 class="wrap">${this.sigPubJwkHash}</h3>
        <p class="sharable wrap">${this.sharable}</p>
        </div>
      </header>
      <div class="main">
        <div class="contacts">
          <ul class="contact-list">
            ${this.contacts.map(contact =>
              html`<li class="contact wrap" @click=${() => this.selectContact(contact)}>${contact.name} [${contact.sigPubJwkHash}]</li>`
            )}
          </ul>
          <input id="contact-addtext" placeholder="Enter a contact string (base64)">
          <button @click=${this.addContact}>Add</button>
        </div>
        <div class="messages">
          <ul class="contact-list">
            ${messages.map(message =>
              html`<li class="message wrap">${message.txt}</li>`
            )}
          </ul>
        </div>
      </div>
      <footer>
      </footer>
    `;
  }

  toggleCompleted(item) {
    item.completed = !item.completed
    this.requestUpdate()
  }

  async addContact() {
    const inputValue = this.input.value
    if (inputValue.length < 1) {
      console.log('invalid')
      return false
    }
    const jsonString = atob(inputValue)
    let contact = {}
    try {
      contact = JSON.parse(jsonString);
    } catch (e) {
      console.log('failed to parse json', jsonString)
      return
    }
    if (!contact.sigPubJwk) {
      console.log('failed, missing sigPubJwk', contact)
      return
    }
    const sigPubJwkHashBytes = new Uint8Array(await hash(getJwkBytes(contact.sigPubJwk)))
    contact.sigPubJwkHash = base58().encode(sigPubJwkHashBytes)
    this.contacts.push(contact);
    localStorage.setItem("contacts", JSON.stringify(this.contacts))
    this.input.value = '';
    this.requestUpdate();
  }

  selectContact(contact) {
		this.selectedContact = contact
    console.log('selected', this.selectedContact)
	}

  get input() {
    return this.renderRoot?.querySelector('#contact-addtext') ?? null;
  }
}
