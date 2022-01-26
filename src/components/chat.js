import { LitElement, html, css } from "lit"
import {Task} from "@lit-labs/task"
import { pack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { buildMessage } from "../core/message.js"
import { importDHKey, importAuthKey } from "../core/keys.js"
import { fromBase64, toBase64 } from "../util/base64.js"
import { openDBConn } from "../core/db.js"
import { avatarFallbackURL } from "./app.js"

export class Chat extends LitElement {

  task = new Task(
    this,
    async ([pubKeyHash, cursorPosition, limit]) => {
      console.log("messages for", pubKeyHash, cursorPosition, limit)
      this.reactiveMsgs = []
      return this.fetchMessages(pubKeyHash, cursorPosition, limit)
    },
    () => [this.contact?.keys.pubKeyHash, this.cursorPosition, this.limit]
  )

  static get properties() {
    return {
      myKeys: { type: Object },
      contact: { type: Object },
      cursorPosition: { type: Number },
      limit: { type: Number },
      reactiveMsgs: { type: Array }
    }
  }

  static get styles() {
    return [
      formStyles,
      css`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .header {
          display: flex;
          align-items: center;
          padding: 5px;
          position: sticky;
          top: 0;
          min-height: 50px;
          background-color: var(--color-offwhite);
          filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
        }

        .compose {
          position: sticky;
          bottom: 0;
          padding: 5px;
          display: flex;
          background-color: var(--color-offwhite);
          filter: drop-shadow(0 -5px 5px rgba(0, 0, 0, 0.1));
        }

        input {
          flex-grow: 1;
        }

        .avatar {
          width: 40px;
          height: 40px;
          margin-left: 10px;
          border-radius: 50%;
          border: 2px solid var(--color-secondary);
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }

        .icon {
          border: 0;
          outline: 0;
          background: transparent;
          border: 2px solid var(--color-lightgrey);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon img {
          width: 30px;
          height: 30px;
        }

        .icon:hover, .icon:focus {
          border: 2px solid var(--color-primary)
        }
      `,
    ]
  }

  constructor() {
    super()
    this.init()
    this.cursorPosition = 0
    this.limit = 50
    this.reactiveMsgs = []

    window.addEventListener("messageReceived", event => {
      this.reactiveMsgs.push(event.detail)
      this.requestUpdate()
    })
  }

  timeTemplate(msgTime, prevMsgTime) {
    if (!prevMsgTime) return
    const msgDate = new Date(msgTime)
    const prevDate = new Date(prevMsgTime)
    const ms = msgDate - prevDate
    const hoursSincePrev = ms / 1000 / 60 / 60
    
    // if not same day as prev
    if (msgDate.getDay !== prevDate.getDay || hoursSincePrev >= 24) {
      // if msg is today show "Today"
      if (msgDate.getDay() === new Date(Date.now()).getDay()) {
        return html`
        <div class="milestone">Today</div>
        `
      }
      // show date
      const date = new Intl.DateTimeFormat().format(msgDate)
      return html`
      <div class="milestone">${date}</div>
      `
    }
  }

  messageTemplate(msg, prevMsgTime) {
    return html`
      ${this.timeTemplate(msg.t, prevMsgTime)}
      <div class="message">
        <p>${msg.m}</p>
      </div>
    `
  }

  headerTemplate() {
    if (!this.contact) return
    return html`
    <div class="header">
      <button @click=${this.clearContact} class="icon">
        <img alt="back" src="assets/arrow_back.svg" />
      </button>
      <img
          alt="${this.contact.displayName}"
          src=${this.contact.avatarURL || avatarFallbackURL}
          class="avatar"
        />
        <span class="name">${this.contact.displayName}</span>
    </div>
    `
  }

  render() {
    let prevMsgTime
    return html`
      <div class="container">
        ${this.headerTemplate()}
        <div class="list">
          ${this.task.render({
            complete: (msgs) => html`${msgs.map(m => {
              const template = this.messageTemplate(m, prevMsgTime)
              prevMsgTime = m.t
              return template
            })}`
          })}
          ${this.reactiveMsgs?.map(m => this.messageTemplate(m))}
        </div>
        <form
          class="compose"
          ?hidden=${!this.contact}
          @submit=${this.handleSubmit}
        >
          <input type="text" placeholder="write a message" name="messageText" />
        </form>
      </div>
    `
  }

  async init() {
    this.db = await openDBConn()
  }

  async setContact(contact) {
    this.contact = contact
    if (!this.contact) return
    this.theirKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, [
        "verify",
      ]),
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
      messageText,
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
      sent: resp.status === 200
    }
    this.db.put("messages", toStore, msg.t)
    this.reactiveMsgs.push(toStore)
    this.requestUpdate()
    localStorage.lastMessagePubKeyHash = this.contact.keys.pubKeyHash
  }

  async fetchMessages(pubKeyHash, position, limit) {
    if (!pubKeyHash) return []
    const tx = this.db.transaction("messages", "readonly")
    const index = tx.store.index("with")
    const cursor = await index.openKeyCursor(pubKeyHash, "prev")
    if (!cursor) return []

    if (position > 0) await cursor.advance(position)

    const keys = []
    if (cursor) for await (const c of cursor) {
      if (keys.length >= limit) {
        break;
      }
      keys.push(c.primaryKey)
    }
    
    const msgs = []
    for await (const k of keys) {
     msgs.push(await this.db.get("messages", k))
    }
    return msgs
  }
}
