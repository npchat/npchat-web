import {LitElement, html, css} from 'lit';
import { base58 } from '../util/base58';
import { hash } from '../util/hash';
import { exportKey, genKeyPair, importKey } from '../util/key';

export class Client extends LitElement {
  static properties = {
    me: {},
    name: {},
    sigPubJwkHash: {},
    sigPubJwk: {},
    sigPrivJwk: {},
    contacts: {},
    selectedContact: {},
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
      font-size: 1.2rem
    }
    button {
      padding: 0.25rem;
      font-size: 1rem
    }
  `;

  constructor() {
    super()
    this.me = {}
    this.name = "Joey"
    this.sigPubJwkHash = {}
    this.sigPubJwk = {}
    this.sigPrivJwk = {}
    this.selectedContact = {}
    this.contacts = [
      {name: "Mongo"}
    ]
    this.messages = [
      {msg: "test message"}
    ]
  }

  connectedCallback() {
    super.connectedCallback()
    this.initKeys()
    .then(() => this.initMe())
    .then(() => console.log('init done'))
  }

  async initKeys() {
    console.log('genKeyPair...')
    const storedSigPubJwk = localStorage.getItem("sigPubJwk")
    const storedSigPrivJwk = localStorage.getItem("sigPrivJwk")
    if (!storedSigPubJwk || !storedSigPrivJwk) {
      const keyPair = await genKeyPair()
      console.log(keyPair)
      const sigPubJwk = await exportKey(keyPair.publicKey)
      const sigPrivJwk = await exportKey(keyPair.privateKey)
      localStorage.setItem("sigPubJwk", JSON.stringify(sigPubJwk))
      localStorage.setItem("sigPrivJwk", JSON.stringify(sigPrivJwk))
      await this.initKeys()
      return
    }
    const parsedSigPubJwk = JSON.parse(storedSigPubJwk)
    this.sigPubJwk = parsedSigPubJwk
    this.sigPubKey = await importKey(parsedSigPubJwk)
    console.log(this.sigPubKey)
    const parsedSigPrivJwk = JSON.parse(storedSigPrivJwk)
    this.sigPrivJwk = parsedSigPrivJwk
    this.sigPrivKey = await importKey(parsedSigPrivJwk)  

    console.log('initKeys done')
  }

  async initMe() {
    const storedSigPubJwk = localStorage.getItem("sigPubJwk")
    const sigPubJwkBytes = new TextEncoder().encode(storedSigPubJwk)
    this.sigPubJwkHash = new Uint8Array(await hash(sigPubJwkBytes))
    console.log('initMe done')
  }

  render() {
    const contacts = this.contacts
    

    return html`
      <header>
        <h1>Openchat client</h1>
        <div>
        <h2>${this.name}</h2>
        <p>${this.meBase58}</p>
        </div>
      </header>
      <div>
        <ul class="contacts">
          ${contacts.map((contact) =>
            html`<li @click=${() => this.selectContact(contact)}>${contact.name}</li>`
          )}
        </ul>
        <input id="contact-addtext" placeholder="Enter a contact string (base58)">
        <button @click=${this.addContact}>Add</button>
      </div>
      <footer>
      </footer>
    `;
  }

  toggleCompleted(item) {
    item.completed = !item.completed
    this.requestUpdate()
  }

  addContact() {
    const inputValue = this.input.value
    if (inputValue.length < 1) {
      console.log('invalid')
      return false
    }
    
    const bytes = base58().decode(inputValue)
    const jsonString = new TextDecoder().decode(bytes)

    console.log('decoded', jsonString)

    let parsed = {}
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.log('failed')
      return
    }

    console.log('parsed', parsed)

    this.contacts.push(parsed);
    this.input.value = '';
    this.requestUpdate();
  }

  get input() {
    return this.renderRoot?.querySelector('#contact-addtext') ?? null;
  }

	selectContact(contact) {
		this.selectedContact = contact
    console.log('selected', this.selectedContact)
	}
}
