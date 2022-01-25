import { LitElement, html, css } from "lit"
import { pack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { fromHex } from "../util/hex.js"
import { buildMessage } from "../util/message.js"
import { importDHKey, importAuthKey } from "../util/keys.js"

export class Contact extends LitElement {

  static get properties() {
    return {
      shareableData: {type: Object},
      messages: {type: Array},
      myKeys: {type: Object}
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
      `
    ]
  }

  async willUpdate() {
    if (!this.shareableData) return
    this.theirKeys = {
      auth: await importAuthKey("jwk", this.shareableData.keys.auth, ["verify"]),
      dh: await importDHKey("jwk", this.shareableData.keys.dh, [])
    }
    this.myPubKeyHashBytes = fromHex(this.myKeys.pubKeyHash)
  }

  constructor() {
    super()
    window.addEventListener("contactsChanged", () => {
      this.requestUpdate()
    })
  }

  messageTemplate(message) {
    return html`
      <div class="message">
        <p>${message.m}</p>
      </div>
    `
  }

  render() {
    return html`
    <div class="container">
      <div class="list" ?hidden=${!this.shareableData}>
        ${this.messages && this.messages.map(m => this.messageTemplate(m))}
      </div>
      <form class="compose"
        ?hidden=${!this.shareableData}
        @submit=${this.handleSubmit}>
        <input type="text" placeholder="write a message" name="messageText"/>
      </form>
    </div>
    `
  }

  async handleSubmit(e) {
    e.preventDefault()
    const {messageText} = Object.fromEntries(new FormData(e.target))
    const message = await buildMessage(
      this.myKeys.auth.keyPair.privateKey,
      this.myKeys.dh.keyPair.privateKey,
      messageText,
      this.myPubKeyHashBytes,
      this.theirKeys.dh
    )
    const url = `${this.shareableData.originURL}/${this.shareableData.keys.pubKeyHash}`
    const resp = await fetch(url, {
      method: "POST",
      body: pack(message)
    })
    message.sent = resp.status === 200
    this.dispatchEvent(new CustomEvent("messageSent", {
      detail: message
    }))
    this.requestUpdate()
  }
}
