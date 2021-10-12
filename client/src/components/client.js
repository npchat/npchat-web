import { LitElement, html, css } from "lit";
import { getWebSocket, handshakeWebsocket } from "../../../util/websocket";
import { AuthController } from '../controllers/auth';
import { ContactController } from "../controllers/contact";
import { MessageController } from '../controllers/message';
import { PreferenceController } from "../controllers/preference";

export class Client extends LitElement {
  pref = new PreferenceController(this)
  contact = new ContactController(this)
  auth = new AuthController(this)
  message = new MessageController(this)

  static properties = {
    pref: {},
    contact: {},
    auth: {},
    message: {},
    websocket: {},
    isWebsocketOpen: {},
    isAuthed: {}
  }

  static styles = css`,,,,
    header, .main, footer {
      max-width: 600px
    }
    .main > div {
      margin: 2rem 0;
    }
    button, input {
      padding: 0.25rem;
      font-size: 1rem;
    }
    input[type=text] {
      width: 300px;
      max-width: 100%
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
    .monospace {
      font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      font-size: .8rem
    }
    img {
      max-width: 100%
    }
    .error {
      color: #cc0000
    }
    .warn {
      color: #ff6700
    }
  `;

  constructor() {
    super()
    this.initClient()
  }

  async initClient() {
    await this.pref.init()
    try {
      await this.auth.init()
    } catch (e) {
      this.isAuthed = false
      this.isWebsocketOpen = false
      this.auth.challenge = null
      console.log("auth failed", e)
      return false
    }
    this.isAuthed = true
    await this.message.init()
    try {
      await this.connectWebSocket()
    } catch (e) {
      console.log("websocket connection failed", e)
      this.isWebsocketOpen = false
    }
    return true
  }

  async handleAddContact() {
    const added = this.contact.addContactFromShareable(this.contactInput.value)
    if (added) {
      this.contactInput.value = ""
    }
  }

  async handleSendMessage(event) {
    event.preventDefault()
    const c = this.contact.selected
    if (!c.keys) {
      console.log("no contact selected")
      return
    }
    await this.message.handleSendMessage(c.inboxDomain, c.keys.sig.publicHash, this.messageInput.value)
    this.messageInput.value = ""
  }

  async handleMessageInputKeyUp(event) {
    console.log(event)
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.websocket = getWebSocket(this.pref.inboxDomain, this.pref.keys.sig.publicHash)
      this.websocket.addEventListener("open", async () => {
        this.isWebsocketOpen = true
        handshakeWebsocket(this.websocket, this.pref.keys.sig.jwk.public, await this.auth.getChallengeSig())
      })
      this.websocket.addEventListener("message", async event => {
        const data = JSON.parse(event.data)
        if (data.t && data.m && data.f) {
          await this.message.handleRecievedMessage(data, true)
        }
        if (!data.error) {
          resolve(data)
        } else {
          reject(data)
        }
      })
      this.addEventListener("close", () => {
        console.log("connection closed")
        this.isWebsocketOpen = false
      })
    });
  }

  handleChangeName(event, enforceNotBlank) {
    this.pref.changeName(event.target.value, enforceNotBlank)
  }

  async handleChangeInboxDomain(event) {
    await this.pref.changeInboxDomain(event.target.value)
    await this.initClient()
  }

  handleChangeAcceptOnlyVerified(event) {
    this.pref.changeAcceptOnlyVerified(event.target.checked)
  }

  handleDismissShareables() {
    this.pref.dismissShareables()
  }
  
  headerTemplate() {
    return html `
      <header>
        <h1>Openchat client</h1>
        <div>
          <h2>Hello, ${this.pref.name} ☺️</h2>
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
      <span>It's in your preferences.</span>
      <button class="dismiss" @click=${this.handleDismissShareables}>Got it</button>
    `;
    return html`
    <div class="shareable">
      ${isDismissable ? dismissTemplate : undefined}
      <div class="box">
        <p class="meta">Your shareable</p>
        <p class="wrap monospace select-all">${this.pref.shareable}</p>
        <div class="qr">${this.qrCodeTemplate()}</div>
      </div>
      <div class="box">
        <p class="meta">Your publicKeyHash</p>
        <p class="wrap monospace select-all">${this.pref.keys.sig.publicHash}</p>
      </div>
    </div>
    `;
  }

  qrCodeTemplate() {
    return html`<img srcset="${this.pref.qrCode}"/>`
  }

  preferencesTemplate() {
    return html`
      <div id="preferences" class="preferences">
        <h2>⚙️ Preferences</h2>
        <div class="preferences-group">
          <h3>🔗 Shareable</h3>
          ${this.shareableTemplate()}
          <label>
            <span>Your name</span>
            <input type="text" id="preferences-name" .value=${this.pref.name} @input=${e => this.handleChangeName(e, false)} @change=${e => this.handleChangeName(e, true)}/>
          </label>
        </div>
        <div class="preferences-group">
          <h3>🌐 Domain</h3>
          <p>This must point to a service that implements the <a href="https://github.com/dr-useless/openchat">openchat protocol</a>.</p>
          <label>
            <span>Domain</span>
            <input type="text" id="preferences-domain" .value=${this.pref.inboxDomain} @change=${this.handleChangeInboxDomain} />
            <span class="error" .hidden=${this.isAuthed}>💥 Connection failed</span>
            <span class="warn" .hidden=${!this.isAuthed || this.isWebsocketOpen}>⚠️ No WebSocket connection</span>
            <span .hidden=${!this.isAuthed || !this.isWebsocketOpen}>👍 Connected</span>
          </label>
        </div>
        <div class="preferences-group">
          <h3>🔒 Security</h3>
          <p>Two conditions must be met for a message to be verified: it must be signed by the sender & the sender must be in your contacts list. You can choose to accept only messages that have been verified.</p>
          <label>
            <span>Accept only verified messages</span>
            <input type="checkbox" id="preferences-accept-only-verified" .checked=${this.pref.acceptOnlyVerified} @change=${this.handleChangeAcceptOnlyVerified}/>
          </label>
        </div>
      </div>
    `;
  }

  contactsTemplate(selectedPubHash) {
    return html`
      <div id="contacts" class="contacts">
        <h2>📇 Contacts</h2>
        <ul class="no-list">
          ${this.contact.list.map(c => this.contactTemplate(c, selectedPubHash))}
        </ul>
        <input id="contact-addtext" placeholder="Enter a shareable">
        <button @click=${this.handleAddContact}>Add</button>
      </div>
    `;
  }

  contactTemplate(c, selectedPubHash) {
    return html`
      <li class="contact wrap ${selectedPubHash === c.keys.sig.publicHash ? "selected" : ""}"
          @click=${() => this.contact.selectContact(c)}>
        ${c.name} [${c.keys.sig.publicHash}]
      </li>
    `;
  }

  messagesTemplate(messages) {
    return html`
      <div id="messages" class="messages">
        <h2>✉️ Messages ${this.contact.selected.name ? "with "+this.contact.selected.name : ""}</h2>
        <ul class="no-list">
          ${messages.map(m => this.messageTemplate(m))}
        </ul>
        <form class="compose" @submit=${this.handleSendMessage}>
          <input id="message-compose" type="text"
            placeholder="Write a message to ${this.contact.selected.name}"/>
          <button type="submit">Send</button>
        </form>
      </div>
    `;
  }

  messageTemplate(message) {
    const sent = message.f === this.pref.keys.sig.publicHash
    const v = message.v === true
    return html`<li class="message wrap ${v ? "verified" : "warn"} ${sent ? "sent" : "recieved"}"><div class="message-header">${v ? "verified" : ""}</div><div>${message.m}</div></li>`
  }

  render() {
    let messages = this.message.list || []
    let selectedPubHash
    if (this.contact.selected.name) {
      selectedPubHash = this.contact.selected.keys.sig.publicHash
      messages = (this.message.list || []).filter(m => m.f === selectedPubHash || !m.to)
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
