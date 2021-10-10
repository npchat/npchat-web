import { LitElement, html, css } from "lit";
import { challengeKey, fetchChallenge, hasChallengeExpired, signChallenge } from "../../../util/auth";
import { base58 } from "../../../util/base58";
import { hash } from "../../../util/hash";
import { getJwkBytes, importKey } from "../../../util/key";
import { buildMessage, fetchMessages, messagesKey, sendMessage, verifyMessage } from "../../../util/message";
import { getWebSocket, handshakeWebsocket } from "../../../util/websocket";
import { ContactsController } from "../controllers/contacts";
import { PreferencesController } from "../controllers/preferences";

export class Client extends LitElement {
  pref = new PreferencesController(this)
  contacts = new ContactsController(this)

  static properties = {
    challenge: {},
    challengeSig: {},
    messages: {},
    websocket: {}
  }

  static styles = css`,,,,
    header, .main, footer {
      max-width: 600px
    }
    .main > div {
      margin: 5rem 0;
    }
    button, input {
      padding: 0.25rem;
      font-size: 1rem;
    }
    .box {
      background-color: #f5f5f5;
      display: block;
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 2px;
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
    .message.sent {
      
    }
    .meta {
      color: #555;
      font-size: .8rem;
      user-select: none;
    }
    .select-all {
      user-select: all;
    }
    .warn {
      background-color: #ff6700
    }
    .monospace {
      font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      font-size: .8rem
    }
  `;

  constructor() {
    super()
    this.challenge = {}
    this.challengeSig = {}
    this.messages = []
    this.websocket = {}
  }

  connectedCallback() {
    super.connectedCallback()
    this.pref.initPromise.then(() => {
      this.initMessages()
      .then(() => this.connectWebSocket())
      .then(() => console.log("init done"))
    })
  }

  async initMessages() {
    const stored = localStorage.getItem(messagesKey)
    if (!stored) {
      this.messages = []
    } else {
      this.messages = JSON.parse(stored)
    }
    const fetched = await fetchMessages(this.pref.inboxDomain, this.pref.keys.sig.jwk.public, this.pref.keys.sig.publicHash, await this.getChallengeSig())
    fetched.forEach(async m => await this.handleRecievedMessage(m))
    localStorage.setItem(messagesKey, JSON.stringify(this.messages))
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
        this.challengeSig = await signChallenge(this.pref.keys.sig.keyPair.privateKey, this.challenge.txt)
        return this.challengeSig;
      }
    }
    const challenge = await fetchChallenge(this.pref.inboxDomain, this.pref.keys.sig.publicHash)
    localStorage.setItem(challengeKey, JSON.stringify(challenge))
    this.challenge = challenge
    this.challengeSig = await signChallenge(this.pref.keys.sig.keyPair.privateKey, challenge.txt)
    return this.challengeSig
  }

  async handleAddContact() {
    const inputValue = this.contactInput.value
    if (inputValue.length < 1) {
      console.log("invalid")
      return false
    }
    const bytes = base58().decode(inputValue)
    const jsonString = new TextDecoder().decode(bytes)
    let contact = {}
    try {
      contact = JSON.parse(jsonString);
    } catch (e) {
      console.log("failed to parse json", jsonString)
      return
    }
    if (!this.contacts.isValid(contact)) {
      console.log("failed, missing keys, inboxDomain or name", contact)
      return
    }
    const publicHashBytes = new Uint8Array(await hash(getJwkBytes(contact.keys.sig.jwk)))
    contact.keys.sig.publicHash = base58().encode(publicHashBytes)
    this.contacts.addContact(contact)
    this.contactInput.value = "";
    this.requestUpdate();
  }

  async handleSendMessage() {
    const message = this.messageInput.value.trim()
    if (message.length < 1) {
      return
    }
    if (!this.contacts.selected.keys.sig.publicHash) {
      console.log("no contact selected")
      return
    }
    const c = this.contacts.selected
    const res = await sendMessage(c.inboxDomain, this.pref.keys.sig.keyPair.privateKey, message, this.pref.keys.sig.publicHash, c.keys.sig.publicHash)
    if (res.error) {
      console.log("error", res)
      return
    }
    this.messageInput.value = ""
    // build a local version for storage
    const sentMessage = await buildMessage(undefined, message, this.pref.keys.sig.publicHash, c.keys.sig.publicHash)
    this.messages.push(sentMessage)
    localStorage.setItem(messagesKey, JSON.stringify(this.messages))
    this.requestUpdate()
  }

  async connectWebSocket() {
    this.websocket = getWebSocket(this.pref.inboxDomain, this.pref.keys.sig.publicHash)
    this.websocket.addEventListener("open", async () => {
      console.log("connection open")
      handshakeWebsocket(this.websocket, this.pref.keys.sig.jwk.public, await this.getChallengeSig())
    })
    this.websocket.addEventListener("message", async event => {
      const data = JSON.parse(event.data)
      await this.handleRecievedMessage(data)
      localStorage.setItem(messagesKey, JSON.stringify(this.messages))
    })
    this.addEventListener("close", () => {
      console.log("connection closed")
      this.websocket = null
    })
  }

  async handleRecievedMessage(data) {
    if (data.m && data.from) {
      let isVerified = false
      const contactMatch = this.contacts.list.find(c => c.keys.sig.publicHash === data.from)
      // we need a contactMatch to get the public key, & the message must contain a hash & sig
      if (contactMatch && data.h && data.sig) {
        const contactSigPub = await importKey(contactMatch.keys.sig.jwk, ["verify"])
        isVerified = await verifyMessage(contactSigPub, data)
      }
      if (isVerified || !this.pref.acceptOnlyVerified) {
        const storable = {
          t: data.t,
          m: data.m,
          from: data.from,
          h: data.h,
          v: isVerified
        }
        this.messages.push(storable)
        console.log("stored", storable)
        this.requestUpdate()
      } else {
        console.log("rejected unverified message")
      }
    }
  }

  handleChangeName(event) {
    this.pref.changeName(event.target.value)
  }

  handleChangeInboxDomain(event) {
    this.pref.changeInboxDomain(event.target.value)
  }

  handleChangeAcceptOnlyVerified(event) {
    console.log(event.target)
    this.pref.changeAcceptOnlyVerified(event.target.checked)
  }

  handleDismissShareables() {
    console.log("dismissed")
    this.pref.dismissShareables()
  }
  

  headerTemplate() {
    return html `
      <header>
        <h1>Openchat client</h1>
        <div>
          <h2>Hello, ${this.pref.name}</h2>
          ${this.shareableTemplate(true)}
        </div>
      </header>
    `;
  }

  shareableTemplate(isDismissable) {
    if (isDismissable && this.pref.shareablesDismissed) {
      return html``
    }
    const dismissTemplate = html`
      <span>It"s in your preferences.</span>
      <button class="dismiss" @click=${this.handleDismissShareables}>Got it</button>
    `;
    return html`
    <div class="shareable">
      ${isDismissable ? dismissTemplate : undefined}
      <div class="box">
        <p class="meta">Your publicKeyHash</p>
        <p class="wrap monospace select-all">${this.pref.keys.sig.publicHash}</p>
      </div>
      <div class="box">
        <p class="meta">Your shareable</p>
        <p class="wrap monospace select-all">${this.pref.shareable}</p>
        <div class="qr">${this.qrCodeTemplate()}</div>
      </div>
    </div>
    `;
  }

  qrCodeTemplate() {
    return html`<img src="${this.pref.qrCode}"/>`
  }

  preferencesTemplate() {
    return html`
      <div id="preferences" class="preferences">
        <h2>Preferences</h2>
        <div class="preferences-group">
          <h3>Shareable</h3>
          ${this.shareableTemplate()}
          <label>
            <span>Your name</span>
            <input type="text" id="preferences-name" .value=${this.pref.name} @change=${this.handleChangeName}/>
          </label>
        </div>
        <div class="preferences-group">
          <h3>Domain</h3>
          <p>This must point to a service that implements the <a href="https://github.com/dr-useless/openchat">openchat protocol</a>.</p>
          <label>
            <span>Domain</span>
            <input type="text" id="preferences-domain" .value=${this.pref.inboxDomain} @change=${this.handleChangeInboxDomain}/>
          </label>
        </div>
        <div class="preferences-group">
          <h3>Security</h3>
          <p>Two conditions must be met for a message to be verified: it must be signed by the sender & the sender must be in your contacts list. You can choose to accept only messages that have been verified.</p>
          <label>
            <span>Accept only verified messages</span>
            <input type="checkbox" id="preferences-accept-only-verified" .checked=${this.pref.acceptOnlyVerified} @change=${this.handleChangeAcceptOnlyVerified}
          </label>
        </div>
      </div>
    `;
  }

  contactsTemplate(selectedPubHash) {
    return html`
      <div id="contacts" class="contacts">
        <h2>Contacts</h2>
        <ul class="no-list">
          ${this.contacts.list.map(contact =>
            html`
            <li class="contact wrap ${selectedPubHash === contact.keys.sig.publicHash ? "selected" : ""}"
                @click=${() => this.contacts.selectContact(contact)}>
              ${contact.name} [${contact.keys.sig.publicHash}]
            </li>
            `
          )}
        </ul>
        <input id="contact-addtext" placeholder="Enter a shareable">
        <button @click=${this.handleAddContact}>Add</button>
      </div>
    `;
  }

  messagesTemplate(messages) {
    return html`
      <div id="messages" class="messages">
        <h2>Messages</h2>
        <div class="compose">
            <input id="message-compose" type="text"
              placeholder="Write a message to ${this.contacts.selected.name}"/>
            <button @click=${this.handleSendMessage}>Send</button>
        </div>
        <ul class="no-list">
          ${messages.map(message => this.messageTemplate(message))}
        </ul>
      </div>
    `;
  }

  messageTemplate(message) {
    const sent = message.from === this.pref.keys.sig.publicHash
    const v = message.v === true || sent
    return html`<li class="message wrap ${v ? "" : "warn"} ${sent ? "sent" : "recieved"}"><div class="message-header">${v ? "" : ""}</div><div>${message.m}</div></li>`
  }

  manageDataTemlate() {
    return html`
    `;
  }

  render() {
    let messages = this.messages
    let selectedPubHash
    if (this.contacts.selected.keys) {
      selectedPubHash = this.contacts.selected.keys.sig.publicHash
      messages = messages.filter(m => m.from === selectedPubHash || m.to === selectedPubHash)
    }
    return html`
      ${this.headerTemplate()}
      <div class="main">
        ${this.preferencesTemplate()}
        ${this.contactsTemplate(selectedPubHash)}
        ${this.messagesTemplate(messages)}
      </div>
    `;
  }

  

  get contactInput() {
    return this.renderRoot?.querySelector("#contact-addtext") ?? null;
  }

  get messageInput() {
    return this.renderRoot?.querySelector("#message-compose") ?? null;
  }
}
