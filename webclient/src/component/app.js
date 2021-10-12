import { html } from "lit";
import { getWebSocket, handshakeWebsocket } from "../../../util/websocket";
import { AuthController } from '../controller/auth';
import { ContactController } from "../controller/contact";
import { MessageController } from '../controller/message';
import { PreferenceController } from "../controller/preference";
import { Base } from './base';

export class App extends Base {
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
    isAuthed: {},
    selectedMenu: {}
  }

  constructor() {
    super()
    this.selectedMenu = "contacts"
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

  async handleAddContact(event) {
    const added = this.contact.addContactFromShareable(event.target.value)
    if (added) {
      event.target.value = ""
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

  selectMenu(menuName) {
    this.selectedMenu = menuName
  }

  selectMenu(event, menuName) {
    event.preventDefault()
    this.selectedMenu = menuName
  }
  
  headerTemplate() {
    return html `
      <header>
        <nav>
          <a href="#" @click=${e => this.selectMenu(e, "preferences")}>⚙️ Preferences</a>
          <a href="#" @click=${e => this.selectMenu(e, "contacts")}>💬 Contacts</a>
        </nav>
        <h1>npchat webclient</h1>
        <span class="welcome">Hello, ${this.pref.name} ☺️</span>
        
      </header>
    `;
  }

  shareableTemplate(isDismissable) {
    if (isDismissable && this.pref.shareablesDismissed) {
      return html``
    }
    const dismissTemplate = html`
      <div class="intro">
        <h2>Thanks for trying out npchat</h2>
        <p>Here is your shareable. This is your name & publicKey, encoded as base58. Give it to someone else, and get theirs to start chatting.</p>
        <p>You can find this again in ⚙️ Preferences</span>
        <button class="dismiss" @click=${this.handleDismissShareables}>Got it</button>
      </div>
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
        <p class="wrap monospace select-all">${this.pref.keys.sig && this.pref.keys.sig.publicHash}</p>
      </div>
    </div>
    `;
  }

  qrCodeTemplate() {
    return html`<img srcset="${this.pref.qrCode}"/>`
  }

  preferencesMenuTemplate() {
    return html`
        <npchat-menu
            .content=${this.preferencesTemplate()}
            .isOpen=${this.selectedMenu === "preferences"}>
        </npchat-menu>
      </div>
    `;
  }

  preferencesTemplate() {
    return html`
      <div id="preferences" class="preferences">
        <div class="preferences-group">
            <h3>🔗 Shareable</h3>
            ${this.shareableTemplate()}
            <label>
              <span>Your name</span>
              <input type="text" id="preferences-name"
                  .value=${this.pref.name}
                  @input=${e => this.handleChangeName(e, false)}
                  @change=${e => this.handleChangeName(e, true)}/>
            </label>
          </div>
          <div class="preferences-group">
            <h3>🌐 Domain</h3>
            <p>This must point to a service that implements the <a href="https://github.com/dr-useless/npchat">npchat protocol</a>.</p>
            <label>
              <span>Domain</span>
              <input type="text" id="preferences-domain"
                  .value=${this.pref.inboxDomain}
                  @change=${e => this.handleChangeInboxDomain(e)}/>
            </label>
            ${this.statusTemplate()}
          </div>
          <div class="preferences-group">
            <h3>🔒 Security</h3>
            <p>The npchat protocol is designed to be provably secure, hostable anywhere & interoperable across hosts.</p>
            <p>A key trait of this design is that anyone who has your publicKeyHash & inbox domain can send you messages.</p>
            <p>You cannot trust the authenticity of any message without verifying it cryptographically.</p>
            <p>Two conditions must be met for a message to be verified: it must be signed by the sender & the sender must be in your contacts list. You can choose to accept only messages that have been verified.</p>
            <label>
              <span>Accept only verified messages (recommended)</span>
              <input type="checkbox" id="preferences-accept-only-verified"
                  .checked=${this.pref.acceptOnlyVerified}
                  @change=${e => this.handleChangeAcceptOnlyVerified(e)}/>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  statusTemplate() {
    return html`
      <span class="error" ?hidden=${this.isAuthed}>💥 Connection failed</span>
      <span class="warn" ?hidden=${!this.isAuthed || this.isWebsocketOpen}>⚠️ No WebSocket connection</span>
      <span ?hidden=${!this.isAuthed || !this.isWebsocketOpen}>👍 Connected</span>
    `;
  }
  
  contactsMenuTemplate(selectedPubHash) {
    return html`
        <npchat-menu
            .content=${this.contactsTemplate(selectedPubHash)}
            .isOpen=${this.selectedMenu === "contacts"}>
        </npchat-menu>
      </div>
    `;
  }

  contactsTemplate(selectedPubHash) {
    return html`
      <div id="contacts" class="contacts">
        <ul class="no-list">
          ${this.contact.list.map(c => this.contactTemplate(c, selectedPubHash))}
        </ul>
        <input id="contact-addtext" placeholder="Enter a shareable" @change=${e => this.handleAddContact(e)}>
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
    messages = messages
    .slice(-20, messages.length)
    .sort((a, b) => a.t > b.t)
    return html`
      ${this.headerTemplate()}
      <div class="main">
        <div>
          ${this.shareableTemplate(true)}
          ${this.preferencesMenuTemplate()}
          ${this.contactsMenuTemplate(selectedPubHash)}
        </div>
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
