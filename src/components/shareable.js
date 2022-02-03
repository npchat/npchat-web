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
      formStyles,
      generalStyles,
      css`
        .flex {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        img {
          border-radius: 5px;
        }

        .copy {
          margin: 10px 0;
        }
      `,
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
      <div class="main">
        <h1>Your shareable</h1>
        <div class="flex">
          <div class="monospace">${this.shareableURL}</div>
          <button @click=${this.handleCopy} class="button copy">Copy</button>
          <img alt="QR code" src=${this.shareableQR} />
          <h2>Securely trade keys</h2>
          <p>Share the link or QR code with a friend, and scan/copy theirs.</p>
          <p>
            If you copied it, you must paste it into the text box
            <npchat-route-link route="/" class="link">here</npchat-route-link>
          </p>
          <p>When you've both imported the other's shareable, you can chat.</p>
        </div>
      </div>
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

  canAccess() {
    return !!localStorage.originURL
  }
}
