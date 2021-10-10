import { LitElement, html, css } from 'lit';
import { challengeKey, fetchChallenge, hasChallengeExpired, signChallenge } from '../../../util/auth';
import { base58 } from '../../../util/base58';
import { hash } from '../../../util/hash';
import { exportKey, genKeyPair, getJwkBytes, importKey } from '../../../util/key';
import { buildMessage, fetchMessages, messagesKey, sendMessage } from '../../../util/message';
import { getWebSocket, handshakeWebsocket } from '../../../util/websocket';

export class Client extends LitElement {
  static properties = {
    host: {},
    sharable: {},
    name: {},
    sigKeyPair: {},
    sigPrivJwk: {},
    sigPubJwk: {},
    sigPubJwkHash: {},
    challenge: {},
    challengeSig: {},
    selectedContact: {},
    contacts: {},
    messages: {},
    websocket: {}
  }

  static styles = css`
    header, .main, footer {
      max-width: 600px
    }
    .main > div {
      margin: 5rem 0;
    }
    button {
      padding: 0.25rem;
    }
    .box {
      background-color: #e5e5e5;
      display: block;
      padding: 0.5rem;
      margin: 0.5rem 0;
    }
    .wrap {
      overflow-wrap: anywhere;
    }
    .no-list{
      list-style: none;
      padding: 0
    }
    .contact {
      padding: 0.5rem;
    }
    .contact:hover, .contact.selected {
      background-color: #e5e5e5;
    }
    .message {
      padding: 0.5rem;
    }
    .message.background {
      background-color: #e5e5e5
    }
    .meta {
      color: #333;
      font-size: 0.8rem;
      user-select: none;
    }
    .select-all {
      user-select: all;
    }
  `;

  constructor() {
    super()
    this.host = ""
    this.name = ""
    this.sharable = {}
    this.sigKeyPair = {}
    this.sigPrivJwk = {}
    this.sigPubJwk = {}
    this.sigPubJwkHash = {}
    this.challenge = {}
    this.challengeSig = {}
    this.selectedContact = {}
    this.contacts = []
    this.messages = []
    this.websocket = {}
  }

  connectedCallback() {
    super.connectedCallback()
    this.initDetails()
    this.initContacts()
    this.initKeys()
    .then(() => this.initSharable())
    .then(() => this.initMessages())
    .then(() => this.connectWebSocket())
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
  }

  initDetails() {
    this.name = localStorage.getItem("name")
    if (!this.name) {
      // ask user to input a name
      this.name = "Joey"
      localStorage.setItem("name", this.name)
    }

    this.host = localStorage.getItem("host")
    if (!this.host) {
      // ask user to input a host
      this.host = "openchat.dr-useless.workers.dev"
      localStorage.setItem("host", this.host)
    }
  }

  initSharable() {
    const sharable = {
      name: this.name,
      sigPubJwk: this.sigPubJwk,
      host: this.host
    }
    this.sharable = btoa(JSON.stringify(sharable))
  }

  initContacts() {
    const stored = localStorage.getItem("contacts")
    if (!stored) {
      this.contacts = []
      return
    }
    this.contacts = JSON.parse(stored)
    this.selectContact(this.contacts[0])
  }

  async initMessages() {
    const stored = localStorage.getItem(messagesKey)
    if (!stored) {
      this.messages = []
    } else {
      this.messages = JSON.parse(stored)
    }
    const fetched = await fetchMessages(this.host, this.sigPubJwk, this.sigPubJwkHash, await this.getChallengeSig())
    this.messages.push(...fetched)
    localStorage.setItem("messages", JSON.stringify(this.messages))
    this.requestUpdate();
  }

  async getChallengeSig() {
    if (this.challengeSig && this.challenge.txt && !hasChallengeExpired(this.challenge)) {
      return this.challengeSig
    }
    const stored = localStorage.getItem(challengeKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (!hasChallengeExpired(parsed)) {
        this.challenge = parsed
        this.challengeSig = await signChallenge(this.sigKeyPair.privateKey, this.challenge.txt)
        return this.challengeSig;
      }
    }
    const challenge = await fetchChallenge(this.host, this.sigPubJwkHash)
    localStorage.setItem(challengeKey, JSON.stringify(challenge))
    this.challenge = challenge
    this.challengeSig = await signChallenge(this.sigKeyPair.privateKey, challenge.txt)
    return this.challengeSig
  }

  async addContact() {
    const inputValue = this.contactInput.value
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
    if (!contact.sigPubJwk || !contact.host) {
      console.log('failed, missing sigPubJwk or host', contact)
      return
    }
    const sigPubJwkHashBytes = new Uint8Array(await hash(getJwkBytes(contact.sigPubJwk)))
    contact.sigPubJwkHash = base58().encode(sigPubJwkHashBytes)
    this.contacts.push(contact);
    localStorage.setItem("contacts", JSON.stringify(this.contacts))
    this.contactInput.value = '';
    this.requestUpdate();
  }

  selectContact(contact) {
		this.selectedContact = contact
    console.log('selected', this.selectedContact)
	}

  async handleSendMessage() {
    const message = this.messageInput.value
    if (message.length < 1) {
      return
    }
    if (!this.selectedContact.sigPubJwkHash) {
      console.log('no contact selected')
      return
    }
    const c = this.selectedContact
    const res = await sendMessage(c.host, c.sigPubJwkHash, this.sigPubJwkHash, message)
    console.log('post result', res)
    if (res.error) {
      console.log('error', res)
      return
    }
    const sentMessage = buildMessage(message, c.sigPubJwkHash, this.sigPubJwkHash)
    this.messages.push(sentMessage)
    localStorage.setItem("messages", JSON.stringify(this.messages))
    this.requestUpdate()
  }

  async connectWebSocket() {
    this.websocket = getWebSocket(this.host, this.sigPubJwkHash)
    this.websocket.addEventListener("open", async () => {
      console.log("connection open")
      handshakeWebsocket(this.websocket, this.sigPubJwk, await this.getChallengeSig())
    })
    this.websocket.addEventListener("message", async event => {
      const data = JSON.parse(event.data)
      console.log("ws got", data)
      if (data.m && data.from) {
        this.messages.push(data)
        this.requestUpdate()
        localStorage.setItem("messages", JSON.stringify(this.messages))
      }
    })
    this.addEventListener("close", () => {
      console.log("connection closed")
      this.websocket = null
    })
  }

  render() {
    let messages = this.messages
    if (this.selectedContact.sigPubJwk) {
      messages = messages.filter(m => {
        return m.from === this.selectedContact.sigPubJwkHash ||
        m.to === this.selectedContact.sigPubJwkHash
      })
    }

    return html`
      <header>
        <h1>Openchat client</h1>
        <div>
          <h2>Hello, ${this.name}</h2>
          <div class="box">
            <p class="meta">Your publicKeyHash</p>
            <p class="wrap select-all">${this.sigPubJwkHash}</p>
          </div>
          <div class="box">
            <p class="meta">Your sharable</p>
            <p class="wrap select-all">${this.sharable}</p>
          </div>
        </div>
      </header>
      <div class="main">
        <div class="contacts">
          <ul class="no-list">
            ${this.contacts.map(contact =>
              html`<li class="contact wrap ${this.selectedContact.sigPubJwkHash === contact.sigPubJwkHash ? "selected" : ""}" @click=${() => this.selectContact(contact)}>${contact.name} [${contact.sigPubJwkHash}]</li>`
            )}
          </ul>
          <input id="contact-addtext" placeholder="Sharable (base64)">
          <button @click=${this.addContact}>Add</button>
        </div>
        <div class="messages">
          <div class="compose">
              <input id="message-compose" type="text"
                placeholder="Write a message to ${this.selectedContact.name ? this.selectedContact.name : this.selectedContact.sigPubJwkHash}"/>
              <button @click=${this.handleSendMessage}>Send</button>
          </div>
          <ul class="no-list">
            ${messages.map(message =>
              html`<li class="message wrap">${message.m}</li>`
            )}
          </ul>
        </div>
      </div>
      <footer>
      </footer>
    `;
  }

  

  get contactInput() {
    return this.renderRoot?.querySelector('#contact-addtext') ?? null;
  }

  get messageInput() {
    return this.renderRoot?.querySelector('#message-compose') ?? null;
  }
}
