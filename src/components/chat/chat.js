import { LitElement, html } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { pack } from "msgpackr"
import { formStyles } from "../../styles/form.js"
import { buildMessage } from "../../core/message.js"
import { importDHKey, importAuthKey } from "../../core/keys.js"
import { fromBase64, toBase64 } from "../../util/base64.js"
import { openDBConn } from "../../core/db.js"
import { chatStyles } from "./styles.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"

export class Chat extends LitElement {
  static get properties() {
    return {
      keys: { type: Object },
      pubKeyHash: {},
      contact: { type: Object },
      cursorPos: { type: Number },
      limit: { type: Number },
      reactiveMsgs: { type: Array },
      storedMsgs: { type: Array },
      allLoaded: { type: Boolean }
    }
  }

  static get styles() {
    return [
      formStyles,
      generalStyles,
      chatStyles,
    ]
  }

  get router() {
    return this.renderRoot.querySelector("npchat-router")
  }

  constructor() {
    super()
    this.reactiveMsgs = []
    this.storedMsgs = []
  }

  connectedCallback() {
    super.connectedCallback()

    window.addEventListener("messageReceived", event => {
      if (event.detail.with !== this.contact?.keys.pubKeyHash) return
      this.reactiveMsgs.push(event.detail)
      this.requestUpdate()
    })

    window.addEventListener("route", async event => {
      const route = event.detail
      this.handleRoute(route)
    })

    this.getUpdateComplete().then(async () => {
      await this.init()
      this.handleRoute(location.pathname)
    })
  }

  async getUpdateComplete() {
    await super.getUpdateComplete()
    await this.router.getUpdateComplete()
  }

  updated() {
    this.renderRoot
      .querySelector(".messageContainer:last-of-type")
      ?.scrollIntoView({
        block: "center",
      })
  }

  async handleRoute(route) {
    const paths = route.split("/")
    if (route.startsWith("/chat/") && paths.length >= 3) {
      const pubKeyHash = paths[2]
      await this.setContact(pubKeyHash)
    }
    this.router.active = route
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
        <npchat-route-link route="/" class="button icon">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </npchat-route-link>
        <npchat-route-link
          class="detailsRouteLink"
          route=${this.detailsRoute}>
          <div class="avatarNameGroup">
            <img
              alt="${this.contact.displayName}"
              src=${this.contact.avatarURL || avatarFallbackURL}
              class="avatar"
            />
            <span class="name">${this.contact.displayName}</span>
          </div>
        </npchat-route-link>
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

  chatTemplate() {
    if (!this.contact) return
    return html`
    <div route=${this.chatRoute} class="container">
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

  detailsTemplate() {
    if (!this.contact) return
    return html`
    
    `
  }

  render() {
    return html`
    <npchat-router .basePath=${this.chatRoute}>
      ${this.chatTemplate()}
      <npchat-details
        route=${this.detailsRoute}
        .contact=${this.contact}
      ></npchat-details>
    </npchat-router>
    `
  }

  async init() {
    this.db = await openDBConn()
  }

  async setContact(pubKeyHash) {
    this.pubKeyHash = pubKeyHash
    this.chatRoute = `/chat/${this.pubKeyHash}`
    this.detailsRoute = `${this.chatRoute}/details`

    this.contact = await this.db.get("contacts", pubKeyHash)

    if (!this.contact) return

    this.storedMsgs = []
    this.reactiveMsgs = []
    this.cursorPos = 0
    this.limit = 10
    await this.loadMoreMessages()

    this.theirKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, ["verify"]),
      dh: await importDHKey("jwk", this.contact.keys.dh, []),
    }
    this.myPubKeyHashBytes = fromBase64(this.keys.pubKeyHash)

    this.update()
  }

  async handleSubmit(e) {
    e.preventDefault()
    const { messageText } = Object.fromEntries(new FormData(e.target))
    e.target.querySelector("input").value = ""
    const msg = await buildMessage(
      this.keys.auth.keyPair.privateKey,
      this.keys.dh.keyPair.privateKey,
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
