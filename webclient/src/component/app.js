import { html } from "lit";
import { Base } from "./base";
import { ContactController } from "../controller/contact";
import { MessageController } from "../controller/message";
import { PreferenceController } from "../controller/preference";
import { WebSocketController } from "../controller/websocket";
import { WebPushController } from "../controller/webpush";
import { base64ToBytes } from "../../../util/base64";

export class App extends Base {
  pref = new PreferenceController(this)
  contact = new ContactController(this)
  message = new MessageController(this)
  websocket = new WebSocketController(this)
  webpush = new WebPushController(this)

  static properties = {
    selectedMenu: {},
    exportLinkHidden: {},
    exportQRHidden: {},
    addContactSuccess: {}
  }

  constructor() {
    super()
    // unfortunately this is required to fix the message input position
    window.addEventListener("resize", () => {
      this.requestUpdate()
    })
    this.selectedMenu = "contacts"
    this.exportLinkHidden = true
    this.exportQRHidden = true
    this.initApp()
  }

  async initApp() {
    this.message.init()
    this.contact.init()
    await this.pref.init()
    this.importFromUrlHash()
    try {
      await this.websocket.connect()
    } catch (e) {
      console.log("WebSocket connection failed", e)
      return
    }
    return true
  }

  async importFromUrlHash() {
		const h = window.location.hash.replace("#","")
    window.location.hash = ""
		if (h.length > 0) {
      const bytes = base64ToBytes(h)
      const text = new TextDecoder().decode(bytes)
      try {
        const obj = JSON.parse(text)
        if (obj.contact) {
          await this.contact.addContact(obj.contact)
        } else {
          this.pref.domain = obj.domain || this.pref.domain
          this.pref.name = obj.name || this.pref.name
          this.pref.keys = obj.keys || this.pref.keys
          obj.contacts.forEach(c => this.contact.addContact(c))
          this.contact.store()
        }
        this.pref.store()
        this.initApp()
      } catch (e) {
        console.log("Import failed", e)
      }
		}
	}

  async handleAddContact(event) {
    const added = await this.contact.addContactFromShareable(event.target.value)
    if (added) {
      this.addContactSuccess = true
      setTimeout(() => {
        this.addContactSuccess = undefined
      }, 1000)
    } else {
      this.addContactSuccess = false
      setTimeout(() => {
        this.addContactError = undefined
      }, 1000)
    }
  }

  async handleSendMessage(event) {
    event.preventDefault()
    await this.message.handleSendMessage(this.messageInput.value)
    this.messageInput.value = ""
  }

  handleChangeName(event, enforceNotBlank) {
    this.pref.changeName(event.target.value, enforceNotBlank)
  }

  async handleChangeDomain(event) {
    await this.pref.changeDomain(event.target.value)
    await this.initApp()
  }

  handleDismissWelcome() {
    this.pref.dismissWelcome()
  }

  selectMenu(event, menuName) {
    event.preventDefault()
    this.selectedMenu = menuName
  }

  toggleExportLink() {
    this.exportLinkHidden = !this.exportLinkHidden
    this.exportQRHidden = true
  }

  toggleExportQR() {
    this.exportQRHidden = !this.exportQRHidden
    this.exportLinkHidden = true
  }

  headerTemplate() {
    const isSelectedClass = menu => this.selectedMenu === menu ? "selected" : undefined
    return html `
      <header>
        <nav>
          <a href="#" @click=${e => this.selectMenu(e, "preferences")} class="${isSelectedClass("preferences")}">
            <span class="icon">⚙️</span>
            <span class="label">Preferences</span>
          </a>
          <a href="#" @click=${e => this.selectMenu(e, "contacts")} class="${isSelectedClass("contacts")}">
            <span class="icon">💬</span>
            <span class="label">Chats</span>
          </a>
        </nav>
        <h1>npchat webclient</h1>
        <span class="welcome">Hello, ${this.pref.name} ☺️</span>
        <div class="status ${this.websocket.isConnected ? "connected" : ""}"></div>
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
      <div class="box">
        <p class="meta">Your publicKeyHash</p>
        <p class="wrap monospace select-all">${this.pref.keys.auth && this.pref.keys.auth.publicKeyHash}</p>
      </div>
    `;
    return html`
      <div class="shareable">
        <div class="box">
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
                .value=${this.pref.domain}
                @change=${e => this.handleChangeDomain(e)}
                class="${this.websocket.isConnected ? undefined : "warn"}"/>
          </label>
          ${this.statusTemplate()}
        </div>
        <div class="preferences-group">
          <h3>💾 Import / Export</h3>
          <p>Either scan the QR code or open the link using another device. This will sync your name, keys & domain.</p>
          <a href="https://qrcodescannerpro.com/scan-qr-code" target="_blank" rel="noreferrer noopener" class="link">Online QR code scanner</a>
          <div class="export">
            <p class="warn">⚠️ This is unsafe if anyone can see your screen.</p>
            <button @click=${() => this.toggleExportLink()}>${this.exportLinkHidden ? "Show" : "Hide"} link</button>
            <button @click=${() => this.toggleExportQR()}>${this.exportQRHidden ? "Show" : "Hide"} QR code</button>
            <div ?hidden=${this.exportLinkHidden}>
              <div class="box">
                <div class="wrap monospace select-all">${this.pref.exportLink}</div>
              </div>
            </div>
            <div ?hidden=${this.exportQRHidden}>
              <div class="box">
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
      <span class="meta" ${this.websocket.isConnected ? undefined : "warn"}>
        ${this.websocket.isConnected ? "👍 Connected" : "💥 No connection"}
      </span>
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
    let inputClass = ""
    if (this.addContactSuccess === true) {
      inputClass = "success"
    } else if (this.addContactSuccess === false) {
      inputClass = "warn"
    }
    return html`
      <div id="contacts" class="contacts">
        <ul class="no-list">
          ${this.contact.list.map(c => this.contactTemplate(c, selectedPubHash))}
        </ul>
        <input id="contact-addtext" placeholder="Enter a shareable"
            @change=${e => this.handleAddContact(e)}
            class="${inputClass}">
      </div>
    `;
  }

  contactTemplate(c, selectedPubHash) {
    return html`
      <li class="contact wrap ${selectedPubHash === c.keys.auth.publicKeyHash ? "selected" : ""}">
        <span @click=${() => this.contact.select(c)} class="label">${c.name} [${c.keys.auth.publicKeyHash}]</span>
        <span @click=${() => this.contact.remove(c)}>🗑️</span>
      </li>
    `;
  }

  messagesTemplate(messages) {
    let prevMessageTime
    return html`
      <div id="messages" class="messages" ?hidden=${this.selectedMenu !== "contacts" && this.isMobileView()}>
        <ul class="no-list">
          ${messages.map(m => {
            const template = this.messageTemplate(m, prevMessageTime)
            prevMessageTime = m.t
            return template
          })}
        </ul>
        ${this.contact.selected && this.contact.selected.keys
          ? html`<form class="compose" @submit=${this.handleSendMessage} ?hidden=${this.selectedMenu !== "contacts" && this.isMobileView()}>
              <input id="message-input" type="text"
                placeholder="Write a message to ${this.contact.selected ? this.contact.selected.name : ""}"/>
            </form>`
        : undefined
        }
      </div>
    `;
  }

  messageTemplate(message, prevMessageTime) {
    const sent = message.f === this.pref.keys.auth.publicKeyHash
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
      ${timeElapsedString ? html`<li class="meta milestone">${timeElapsedString}</span>` : undefined}
      <li class="message ${sent ? "sent" : "received"}">
        <div class="message-body">
          <span class="message-text">${message.mP}</span>
          <span class="meta smaller">${time}</span>
        </div>
      </li>`
  }

  render() {
    let messages = this.message.list || []
    let selectedPubHash
    if (this.contact.selected && this.contact.selected.keys) {
      selectedPubHash = this.contact.selected.keys.auth.publicKeyHash
      messages = this.message.list.filter(m => (m.f === selectedPubHash && !m.to) || m.to === selectedPubHash)
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

  isMobileView() {
    return window.innerWidth <= 750
  }

  get contactInput() {
    return this.renderRoot?.querySelector("#contact-addtext") ?? null;
  }

  get messageInput() {
    return this.renderRoot?.querySelector("#message-input") ?? null;
  }
}
