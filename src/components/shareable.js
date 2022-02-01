import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { buildShareableURL } from "../core/shareable.js"
import { generateQR } from "../util/qrcode.js"

export class Shareable extends LitElement {
  static get properties() {
    return {
      originURL: {},
      pubKeyHash: {},
    }
  }

  static get styles() {
    return [
      css`
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }

      .text {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
      }
      `,
      formStyles,
      generalStyles,
    ]
  }

  constructor() {
    super()
    this.shareableURL = ""
    this.shareableQR = ""
  }

  willUpdate() {
    this.shareableURL = buildShareableURL(this.originURL, this.pubKeyHash)

    generateQR(this.shareableURL).then(qr => {
      this.shareableQR = qr
      this.update()
    })
  }

  render() {
    return html`
      <npchat-modal ?canClose=${true}>
        <div class="container">
          <div class="text">
            <div class="monospace">${this.shareableURL}</div>
            <button @click=${this.handleCopy} class="normal copy">Copy</button>
          </div>
          <img alt="QR code" src=${this.shareableQR} />
          <p>
            Share this with others, and scan/copy theirs. When you both have the
            other's shareable, you can chat. This is necessary to securely trade
            keys.
          </p>
          <button @click=${this.handleClose} class="normal">Done</button>
        </div>
      </npchat-modal>
    `
  }

  handleClose(e) {
    e.preventDefault()
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    )
  }

  async handleCopy(e) {
    const button = e.target
    button.classList.add("success")
    setTimeout(() => {
      button.classList.remove("success")
    }, 500)
    await navigator.clipboard.writeText(this.shareableURL)
  }
}
