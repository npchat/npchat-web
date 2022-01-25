import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import {
  buildShareableURL,
} from "../util/shareable.js"
import { generateQR } from "../util/qrcode.js"

export class Shareable extends LitElement {
  static get properties() {
    return {
      showQR: { type: Boolean },
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

        .monospace {
          font-family: monospace;
          font-size: 1.2rem;
          overflow-wrap: anywhere;
          word-break: break-all;
        }
      `,
      formStyles,
    ]
  }

  constructor() {
    super()
    this.shareableURL = ""
    this.shareableQR = ""
  }

  willUpdate() {
    this.shareableURL = buildShareableURL(
      this.originURL,
      this.pubKeyHash
    )

    generateQR(this.shareableURL)
      .then(qr => {
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
            <button @click=${this.handleCopy} class="button copy">Copy</button>
          </div>
          <div ?hidden=${!this.showQR}>
            <img alt="QR code" src=${this.shareableQR} />
          </div>
          <p>
            Share this with others, and scan/copy theirs. When you both have the
            other's shareable, you can chat. This process is necessary to
            securely trade keys.
          </p>
          <button @click=${this.handleClose}>Done</button>
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
    const button = e.path[0]
    button.classList.add("success")
    setTimeout(() => {
      button.classList.remove("success")
    }, 500)
    await navigator.clipboard.writeText(this.shareableURL)
  }
}
