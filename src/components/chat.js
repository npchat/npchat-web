import { LitElement, html, css } from "lit"
import { pack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { buildMessage } from "../core/message.js"
import { importDHKey, importAuthKey } from "../core/keys.js"
import { fromBase64, toBase64 } from "../util/base64.js"
import { openDBConn } from "../core/db.js"

export class Chat extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
      myKeys: { type: Object }
    }
  }

  static get styles() {
    return [
      formStyles,
      css`
        .container {
          margin: 5px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          max-width: 100vw;
        }

        input {
          margin-bottom: 5px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          transition: border-color 300ms;
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }
      `,
    ]
  }

  constructor() {
    super()
    this.messages = []
    this.init()

    window.addEventListener("messageReceived", event => {
      console.log("got message yo!")
      // if from contact, display message
      if (this.contact.keys.pubKeyHash === event.detail.with) {
        console.log("from current", event.detail)
        this.messages.push(event.detail)
        this.update()
      }
    })
  }

  async init() {
    this.db = await openDBConn()
  }

  async willUpdate() {
    if (!this.contact) return
    this.theirKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, [
        "verify",
      ]),
      dh: await importDHKey("jwk", this.contact.keys.dh, []),
    }
    this.myPubKeyHashBytes = fromBase64(this.myKeys.pubKeyHash)

    await this.fetchMessages()
    this.update()
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

  render() {
    let prevMsgTime
    return html`
      <div class="container">
        <div class="list" ?hidden=${!this.contact}>
          ${this.messages?.map(m => {
            const template = this.messageTemplate(m, prevMsgTime)
            prevMsgTime = m.t
            return template
          })}
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

  async fetchMessages() {
    if (!this.contact) return
    this.messages = await this.db.getAllFromIndex("messages", "with", this.contact.keys.pubKeyHash)
    this.messages.sort((a, b) => a.t - b.t)
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
    this.db.put("messages", toStore, toStore.h)
    this.messages.push(toStore)
    this.update()
  }
}
