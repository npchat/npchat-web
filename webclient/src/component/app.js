import { html } from "lit";
import { base58 } from '../../../util/base58';
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
    selectedMenu: {},
    exportHidden: {}
  }

  constructor() {
    super()
    this.selectedMenu = "preferences" //TODO: revert
    this.exportHidden = true
    this.initClient()
  }

  async initClient() {
    this.contact.init()
    await this.pref.init()
    this.importFromUrlHash()
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

  async importFromUrlHash() {
		const h = window.location.hash.replace('#','')
    window.location.hash = ""
		if (h.length > 0) {
      const bytes = base58().decode(h)
      const text = new TextDecoder().decode(bytes)
      try {
        const obj = JSON.parse(text)
        console.log(obj)
        if (obj.contact) {
          await this.contact.addContact(obj.contact)
        } else {
          this.pref.inboxDomain = obj.inboxDomain || this.pref.inboxDomain
          this.pref.name = obj.name || this.pref.name
          this.pref.keys = obj.keys || this.pref.keys
          this.contact.list = obj.contacts || this.contact.list
          this.contact.store()
        }
        this.pref.store()
        this.initClient()
      } catch (e) {
        console.log("import failed", e)
      }
		}
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

  handleDismissWelcome() {
    this.pref.dismissWelcome()
  }

  selectMenu(event, menuName) {
    event.preventDefault()
    this.selectedMenu = menuName
  }

  async showExport() {
    this.exportHidden = !this.exportHidden
  }

  async pushAllMessages() {
    await this.message.pushAllMessages()
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

  welcomeTemplate() {
    return html`
      <div class="intro">
        <h2>Thanks for trying out npchat</h2>
        <p>A non-profit, non-proprietary, private & secure messaging service.</p>
        <p>To begin, please enter a name. This will help other people identify you in their contact list.</p>
        ${this.nameInputTemplate()}
        <p>Below is your shareable. This contains your name & publicKey. Give it to someone else, and get theirs to start chatting.</p>
        <p>You can find this again in ⚙️ Preferences</span>
        <button class="dismiss" @click=${this.handleDismissWelcome}>Got it</button>
        ${this.shareableTemplate(false)}
      </div>
    `;
  }

  shareableTemplate(showPublicKeyHash) {
    const publicKeyHashTemplate = html`
      <div class="box background">
        <p class="meta">Your publicKeyHash</p>
        <p class="wrap monospace select-all">${this.pref.keys.sig && this.pref.keys.sig.publicHash}</p>
      </div>
    `;
    return html`
      <div class="shareable">
        <div class="box background">
          <p class="meta">Your shareable</p>
          <p class="wrap monospace select-all">${this.pref.shareable}</p>
          <div class="qr">${this.qrCodeTemplate(this.pref.qrCodeShareable)}</div>
        </div>
        ${showPublicKeyHash ? publicKeyHashTemplate : undefined}
      </div>
    `;
  }

  qrCodeTemplate(imgDataUrl) {
    return html`<img srcset="${imgDataUrl}"/>`
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

  nameInputTemplate() {
    return html`
      <label>
        <span>Your name</span>
        <input type="text" id="preferences-name"
            .value=${this.pref.name}
            @input=${e => this.handleChangeName(e, false)}
            @change=${e => this.handleChangeName(e, true)}/>
      </label>
    `;
  }

  preferencesTemplate() {
    return html`
      <div id="preferences" class="preferences">
        <div class="preferences-group">
          <h3>🔗 Shareable</h3>
          ${this.shareableTemplate(true)}
          ${this.nameInputTemplate()}
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
        <div class="preferences-group">
          <h3>💾 Import / Export</h3>
          <p>Either scan the QR code or open the link using another device. This will sync your name, keys & inbox domain.</p>
          <p class="warn">⚠️ This feature is unsafe if anyone can see your screen.</p>
          <div class="export">
            <button @click=${() => this.showExport()}>${this.exportHidden ? "Show" : "Hide"} sensitive data</button>
            <div ?hidden=${this.exportHidden}>
              <div class="box background">
                <div class="wrap monospace select-all">${this.pref.exportLink}</div>
                <div class="qr">${this.qrCodeTemplate(this.pref.exportQRCode)}</div>
              </div>
            </div>
          </div>
          <p>You can push all messages to the inbox so that your other device can collect them. They can only be collected once each time, so you may need to push them again.</p>
          <button @click=${() => this.pushAllMessages()}>Push all messages to sync</button>
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
      <li class="contact wrap ${selectedPubHash === c.keys.sig.publicHash ? "selected" : ""}">
        <span @click=${() => this.contact.select(c)}>${c.name} [${c.keys.sig.publicHash}]</span>
        <span @click=${() => this.contact.remove(c)}>🗑️</span>
      </li>
    `;
  }

  messagesTemplate(messages) {
    let prevMessageTime
    return html`
      <div id="messages" class="messages">
        <ul class="no-list">
          ${messages.map(m => {
            const template = this.messageTemplate(m, prevMessageTime)
            prevMessageTime = m.t
            return template
          })}
        </ul>
        ${this.contact.selected && this.contact.selected.keys
          ? html`<form class="compose" @submit=${this.handleSendMessage} >
              <input id="message-compose" type="text"
                placeholder="Write a message to ${this.contact.selected ? this.contact.selected.name : ""}"/>
              <button type="submit">Send</button>
            </form>`
        : undefined
        }
      </div>
    `;
  }

  messageTemplate(message, prevMessageTime) {
    const sent = message.f === this.pref.keys.sig.publicHash
    const v = message.v === true
    const timeElapsedPrev = message.t - (prevMessageTime || message.t)
    const msToDayMultiplier = 0.00000001157407
    const daysElapsedPrev = timeElapsedPrev * msToDayMultiplier

    const messageAge = Date.now() - message.t
    let timeElapsedString;

    if (daysElapsedPrev >= 1) {
      timeElapsedString = `${Math.floor(messageAge * msToDayMultiplier)} day${daysElapsedPrev>1?"s":""} ago`
    }

    return html`
      <li class="meta milestone background">${timeElapsedString}</span>
      <li class="message wrap ${!v ? "warn" : ""} ${sent ? "sent" : "recieved"}">
        <div class="message-body">
          ${message.m}
        </div>
        <div class="message-footer">
          <span class="meta smaller">${v ? "🔑" : "⚠️"}</span>
      </li>`
  }

  render() {
    let messages = this.message.list || []
    let selectedPubHash
    if (this.contact.selected && this.contact.selected.keys) {
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
          ${this.pref.welcomeDismissed ? undefined : this.welcomeTemplate()}
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
