import { LitElement, html } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { pack } from "msgpackr"
import { formStyles } from "../../styles/form.js"
import { buildMessage } from "../../core/message.js"
import { importDHKey, importAuthKey } from "../../core/keys.js"
import { fromBase64, toBase64 } from "../../util/base64.js"
import { openDBConn } from "../../core/db.js"
import { chatStyles } from "./styles.js"
import { avatarFallbackURL } from "../../styles/general.js"

export class Chat extends LitElement {
  static get properties() {
    return {
      myKeys: { type: Object },
      contact: { type: Object },
      cursorPos: { type: Number },
      limit: { type: Number },
      reactiveMsgs: { type: Array },
      storedMsgs: { type: Array },
      allLoaded: { type: Boolean },
    }
  }

  static get styles() {
    return [
      formStyles,
      chatStyles,
    ]
  }

  constructor() {
    super()
    this.init()
    this.reactiveMsgs = []
    this.storedMsgs = []

    window.addEventListener("messageReceived", event => {
      if (event.detail.with !== this.contact?.keys.pubKeyHash) return
      this.reactiveMsgs.push(event.detail)
      this.requestUpdate()
    })
  }

  updated() {
    this.renderRoot
      .querySelector(".messageContainer:last-of-type")
      ?.scrollIntoView({
        block: "center",
      })
  }

  messageTemplate(msg) {
    return html`
      <div id="${msg.t}" class="messageContainer ${classMap({ in: msg.in })}">
        <div class="message">
          <p>${msg.m}</p>
        </div>
      </div>
    `
  }

  headerTemplate() {
    if (!this.contact) return
    return html`
      <div class="header">
        <button @click=${this.clearContact} class="icon">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </button>
        <button
          class="avatarNameGroup"
          @click=${() => (this.showDetails = true)}
        >
          <img
            alt="${this.contact.displayName}"
            src=${this.contact.avatarURL || avatarFallbackURL}
            class="avatar"
          />
          <span class="name">${this.contact.displayName}</span>
        </button>
        ${this.callButtonsTemplate()}
      </div>
    `
  }

  callButtonsTemplate() {
    return html`
      <button class="icon call" @click=${this.startAudioCall}>
        <img alt="audio call" src="assets/icons/phone.svg" />
      </button>
    `
  }

  composeTemplate() {
    return this.inCall
      ? undefined
      : html`
          <form class="compose" @submit=${this.handleSubmit}>
            <input
              type="text"
              placeholder="write a message"
              name="messageText"
            />
          </form>
        `
  }

  render() {
    return html`
      <div class="container">
        ${this.headerTemplate()}
        <div class="list">
          <button
            ?hidden=${this.allLoaded}
            @click=${() => this.loadMoreMessages()}
            class="normal"
          >
            Load more
          </button>
          ${this.storedMsgs?.map(m => this.messageTemplate(m))}
          ${this.reactiveMsgs?.map(m => this.messageTemplate(m))}
        </div>
        ${this.composeTemplate()}
      </div>
    `
  }

  async init() {
    this.db = await openDBConn()
  }

  async setContact(contact) {
    this.contact = contact
    if (!this.contact) return

    this.storedMsgs = []
    this.reactiveMsgs = []
    this.cursorPos = 0
    this.limit = 10
    await this.loadMoreMessages()
    this.allLoaded = this.limit > this.storedMsgs.length

    this.theirKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, ["verify"]),
      dh: await importDHKey("jwk", this.contact.keys.dh, []),
    }
    this.myPubKeyHashBytes = fromBase64(this.myKeys.pubKeyHash)
  }

  clearContact() {
    this.setContact(undefined)
    this.dispatchEvent(new CustomEvent("contactCleared"))
  }

  async handleSubmit(e) {
    e.preventDefault()
    const { messageText } = Object.fromEntries(new FormData(e.target))
    e.target.querySelector("input").value = ""
    const msg = await buildMessage(
      this.myKeys.auth.keyPair.privateKey,
      this.myKeys.dh.keyPair.privateKey,
      new TextEncoder().encode(messageText),
      this.myPubKeyHashBytes,
      this.theirKeys.dh
    )
    const url = `${this.contact.originURL}/${this.contact.keys.pubKeyHash}`
    const resp = await fetch(url, {
      method: "POST",
      body: pack(msg),
    })
    const toStore = {
      t: msg.t,
      h: toBase64(msg.h),
      m: messageText,
      with: this.contact.keys.pubKeyHash,
      in: false, // outgoing
      sent: resp.status === 200,
    }
    this.db.put("messages", toStore, msg.t)
    this.reactiveMsgs.push(toStore)
    this.requestUpdate()
    localStorage.lastMessagePubKeyHash = this.contact.keys.pubKeyHash
  }

  async loadMoreMessages() {
    this.reactiveMsgs = []
    const msgs = await this.fetchMessagesFromDB()
    if (msgs.length > 0) {
      this.storedMsgs = [...msgs.reverse(), ...this.storedMsgs]
    } else {
      this.allLoaded = true
    }
  }

  async fetchMessagesFromDB() {
    const tx = this.db.transaction("messages", "readonly")
    const index = tx.store.index("with")
    const cursor = await index.openKeyCursor(
      this.contact.keys.pubKeyHash,
      "prev"
    )
    if (!cursor) return []

    if (this.cursorPos > 0) {
      const advanced = await cursor.advance(this.cursorPos)
      if (!advanced) return []
    }

    const keys = []
    for await (const c of cursor) {
      keys.push(c.primaryKey)
      if (keys.length >= this.limit) {
        break
      }
    }
    this.cursorPos += keys.length

    const msgs = []
    for await (const k of keys) {
      msgs.push(await this.db.get("messages", k))
    }
    return msgs
  }

  startAudioCall() {
    this.dispatchEvent(
      new CustomEvent("callStart", {
        detail: {
          videoEnabled: true,
          contact: this.contact,
        },
        composed: true,
        bubbles: true,
      })
    )
  }
}
