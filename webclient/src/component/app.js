import { html } from "lit";
import { M } from "qrcode/build/qrcode";
import { signChallenge } from "../../../util/auth";
import { base58 } from "../../../util/base58";
import { getWebSocket } from "../../../util/websocket";
import { ContactController } from "../controller/contact";
import { MessageController } from "../controller/message";
import { PreferenceController } from "../controller/preference";
import { Base } from "./base";

export class App extends Base {
  pref = new PreferenceController(this)
  contact = new ContactController(this)
  message = new MessageController(this)

  static properties = {
    pref: {},
    contact: {},
    message: {},
    webSocket: {},
    isConnected: {},
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
    await this.message.init()
    try {
      await this.connectwebSocket()
      this.isConnected = true
    } catch (e) {
      console.log("WebSocket connection failed", e)
      this.isConnected = false
    }
    return true
  }

  async connectwebSocket() {
    this.webSocket = undefined
    this.isConnected = false
    return new Promise((resolve, reject) => {
      this.webSocket = getWebSocket(this.pref.inboxDomain, this.pref.keys.sig.publicHash)
      this.webSocket.addEventListener("open", () => {
        this.webSocket.send(JSON.stringify({get: "challenge"}))
      })
      this.webSocket.addEventListener("message", async event => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch (e) {
          console.log("Failed to parse JSON", e)
          return
        }
        if (!data.error) {
          if (data.challenge) {
            const sig = await signChallenge(this.pref.keys.sig.keyPair.privateKey, data.challenge)
            this.webSocket.send(JSON.stringify({jwk: this.pref.keys.sig.jwk.public, sig: sig}))
            return
          }
          await this.message.handleReceivedMessage(data, true)
          resolve(data)
        } else {
          reject(data)
        }
      })
      this.addEventListener("close", () => {
        console.log("connection closed")
        this.isConnected = false
        this.webSocket = undefined
      })
    });
  }

  async importFromUrlHash() {
		const h = window.location.hash.replace("#","")
    window.location.hash = ""
		if (h.length > 0) {
      const bytes = base58().decode(h)
      const text = new TextDecoder().decode(bytes)
      try {
        const obj = JSON.parse(text)
        if (obj.contact) {
          await this.contact.addContact(obj.contact)
        } else {
          this.pref.inboxDomain = obj.inboxDomain || this.pref.inboxDomain
          this.pref.name = obj.name || this.pref.name
          this.pref.keys = obj.keys || this.pref.keys
          obj.contacts.forEach(c => this.contact.addContact(c))
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
      return
    }
    await this.message.handleSendMessage(c.inboxDomain, c.keys.sig.publicHash, this.messageInput.value)
    this.messageInput.value = ""
    this.messageInput.scrollIntoView({block: "end", inline: "nearest"})
  }

  handleChangeName(event, enforceNotBlank) {
    this.pref.changeName(event.target.value, enforceNotBlank)
  }

  async handleChangeInboxDomain(event) {
    await this.pref.changeInboxDomain(event.target.value)
    await this.initClient()
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

  headerTemplate() {
    return html `
      <header>
        <nav>
          <a href="#" @click=${e => this.selectMenu(e, "preferences")}>⚙️ Preferences</a>
          <a href="#" @click=${e => this.selectMenu(e, "contacts")}>💬 Contacts</a>
        </nav>
        <h1>npchat webclient</h1>
        <span class="welcome">Hello, ${this.pref.name} ☺️</span>
        <div class="status ${this.isConnected ? "connected" : ""}"></div>
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
          <h3>💾 Import / Export</h3>
          <p>Either scan the QR code or open the link using another device. This will sync your name, keys & inbox domain.</p>
          <a href="https://qrcodescannerpro.com/scan-qr-code" target="_blank" rel="noreferrer noopener">Online QR code scanner</a>
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
          <button @click=${() => this.message.pushAll()}>Push all messages to sync</button>
        </div>
      </div>
    `;
  }

  statusTemplate() {
    return html`
      <span class="error" ?hidden=${this.isConnected}>💥 WebSocket connection failed</span>
      <span ?hidden=${!this.isConnected}>👍 Connected</span>
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
          ? html`<form class="compose" @submit=${this.handleSendMessage}>
              <input id="message-compose" type="text"
                placeholder="Write a message to ${this.contact.selected ? this.contact.selected.name : ""}"/>
            </form>`
        : undefined
        }
      </div>
    `;
  }

  messageTemplate(message, prevMessageTime) {
    const sent = message.f === this.pref.keys.sig.publicHash
    const v = message.v === true
    const msToDayMultiplier = 0.00000001157407
    let time = new Date(message.t).toISOString()
    time = time.split(".")[0]
    if ((Date.now() - message.t) * msToDayMultiplier < 1) {
      time = time.split("T")[1]
    }

    const timeElapsedPrev = message.t - (prevMessageTime || message.t)
    const daysElapsedPrev = Math.floor(timeElapsedPrev * msToDayMultiplier)

    const messageAge = Date.now() - message.t
    const messageAgeDays = Math.floor(messageAge * msToDayMultiplier)
    let timeElapsedString;

    if (daysElapsedPrev >= 1 && messageAgeDays > 0) {
      timeElapsedString = `${messageAgeDays} day${messageAgeDays>1?"s":""} ago`
    }

    return html`
      ${timeElapsedString ? html`<li class="meta milestone background">${timeElapsedString}</span>` : undefined}
      <li class="message wrap ${!v ? "warn" : ""} ${sent ? "sent" : "received"}">
        <div class="message-body">
          <span class="message-text">${message.m}</span>
          <span class="meta smaller">${time} ${v ? "" : "⚠️"}</span>
        </div>
      </li>`
  }

  render() {
    let messages = this.message.list || []
    let selectedPubHash
    if (this.contact.selected && this.contact.selected.keys) {
      selectedPubHash = this.contact.selected.keys.sig.publicHash
      messages = this.message.list.filter(m => m.f === selectedPubHash || m.to === selectedPubHash)
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
