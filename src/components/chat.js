import { LitElement, html, css } from "lit"
import { pack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { buildMessage } from "../util/message.js"
import { importDHKey, importAuthKey } from "../util/keys.js"
import { fromBase64, toBase64 } from "../util/base64.js"

export class Chat extends LitElement {
  static get properties() {
    return {
      shareable: { type: Object },
      messages: { type: Array },
      myKeys: { type: Object },
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

  async willUpdate() {
    if (!this.shareable) return
    this.theirKeys = {
      auth: await importAuthKey("jwk", this.shareable.keys.auth, [
        "verify",
      ]),
      dh: await importDHKey("jwk", this.shareable.keys.dh, []),
    }
    this.myPubKeyHashBytes = fromBase64(this.myKeys.pubKeyHash)
  }

  constructor() {
    super()
    window.addEventListener("contactsChanged", () => {
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

  render() {
    let prevMsgTime
    return html`
      <div class="container">
        <div class="list" ?hidden=${!this.shareable}>
          ${this.messages?.map(m => {
            const template = this.messageTemplate(m, prevMsgTime)
            prevMsgTime = m.t
            return template
          })}
        </div>
        <form
          class="compose"
          ?hidden=${!this.shareable}
          @submit=${this.handleSubmit}
        >
          <input type="text" placeholder="write a message" name="messageText" />
        </form>
      </div>
    `
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
    const url = `${this.shareable.originURL}/${this.shareable.keys.pubKeyHash}`
    const resp = await fetch(url, {
      method: "POST",
      body: pack(msg),
    })
    const toStore = {
      t: msg.t,
      h: toBase64(msg.h),
      m: messageText,
      sent: resp.status === 200,
    }
    this.dispatchEvent(
      new CustomEvent("messageSent", {
        detail: toStore,
      })
    )
    this.requestUpdate()
  }
}
