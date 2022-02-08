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
      allLoaded: { type: Boolean },
    }
  }

  static get styles() {
    return [formStyles, generalStyles, chatStyles]
  }

  get routerComponent() {
    return this.renderRoot.querySelector("npc-router")
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
      this.handleRoute(location.pathname)
    })
  }

  async getUpdateComplete() {
    await super.getUpdateComplete()
    await this.routerComponent.getUpdateComplete()
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
      this.routerComponent.active = route
    }
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
      <npc-toolbar>
        <npc-route-link route="/" class="button icon back">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </npc-route-link>
        <npc-route-link class="detailsRouteLink" route=${this.detailsRoute}>
          <div class="avatarNameGroup">
            <img
              alt="${this.contact.displayName}"
              src=${this.contact.avatarURL || avatarFallbackURL}
              class="avatar"
            />
            <span class="name">${this.contact.displayName}</span>
          </div>
        </npc-route-link>
        ${this.callButtonsTemplate()}
      </npc-toolbar>
    `
  }

  callButtonsTemplate() {
    return html`
      <button
        type="button"
        class="button icon call"
        @click=${this.startAudioCall}
      >
        <img alt="audio call" src="assets/icons/phone.svg" />
      </button>
    `
  }

  composeTemplate() {
    return this.inCall
      ? undefined
      : html`
          <div class="composeContainer">
            <form class="compose" @submit=${this.handleSubmit}>
              <input
                type="text"
                placeholder="message ${this.contact.displayName}"
                name="messageText"
                autocomplete="off"
              />
              <button type="submit">
                <img alt="send" src="assets/icons/send.svg" />
              </button>
            </form>
          </div>
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
            class="button small"
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
      <npc-details
        route=${this.detailsRoute}
        .contact=${this.contact}
      ></npc-details>
    `
  }

  render() {
    return html`
      <npc-router .default=${this.chatRoute || "/"} .basePath=${this.chatRoute}>
        ${this.chatTemplate()} ${this.detailsTemplate()}
      </npc-router>
    `
  }

  async setContact(pubKeyHash) {
    this.pubKeyHash = pubKeyHash
    this.chatRoute = `/chat/${this.pubKeyHash}`
    this.detailsRoute = `${this.chatRoute}/details`

    const db = await openDBConn()
    this.contact = await db.get("contacts", pubKeyHash)
    db.close()

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
    if (!messageText) return
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
    const db = await openDBConn()
    await db.put("messages", toStore, msg.t)
    db.close()
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
    const db = await openDBConn()
    const tx = db.transaction("messages", "readonly")
    const index = tx.store.index("with")
    const cursor = await index.openKeyCursor(
      this.contact.keys.pubKeyHash,
      "prev"
    )

    if (!cursor) {
      db.close()
      return []
    }

    if (this.cursorPos > 0) {
      const advanced = await cursor.advance(this.cursorPos)
      if (!advanced) {
        db.close()
        return []
      }
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
      msgs.push(await db.get("messages", k))
    }
    db.close()
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
