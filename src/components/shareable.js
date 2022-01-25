import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import {
  buildShareableProtocolURL,
  buildShareableFallback,
  buildShareableFallbackURL,
} from "../util/shareable.js"
import { generateQR } from "../util/qrcode.js"

export class Shareable extends LitElement {
  static get properties() {
    return {
      showQR: { type: Boolean },
      showFallback: { type: Boolean },
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
    this.shareableProtocolURL = ""
    this.shareableProtocolQR = ""
    this.shareableFallback = ""
    this.shareableFallbackQR = ""
  }

  willUpdate() {
    this.shareableProtocolURL = buildShareableProtocolURL(
      this.originURL,
      this.pubKeyHash
    )
    this.shareableFallback = buildShareableFallback(
      this.originURL,
      this.pubKeyHash
    )

    const shareableProtocolQRPromise = generateQR(this.shareableProtocolURL)

    const fallbackURL = buildShareableFallbackURL(
      this.originURL,
      this.pubKeyHash
    )
    const shareableFallbackQRPromise = generateQR(fallbackURL)

    Promise.all([shareableProtocolQRPromise, shareableFallbackQRPromise]).then(
      QRs => {
        ;[this.shareableProtocolQR, this.shareableFallbackQR] = QRs
        this.update()
      }
    )
  }

  normalTemplate() {
    return html`
      <div class="text">
        <div class="monospace">${this.shareableProtocolURL}</div>
        <button @click=${this.handleCopy} class="button copy">Copy</button>
      </div>
      <div ?hidden=${!this.showQR}>
        <img alt="QR code" src=${this.shareableProtocolQR} />
      </div>
    `
  }

  fallbackTemplate() {
    return html`
      <p>Give this to your friend, for him to import manually.</p>
      <div class="text">
        <div class="monospace">${this.shareableFallback}</div>
        <button @click=${this.handleCopy} class="button copy">Copy</button>
      </div>
      <div ?hidden=${!this.showQR} class="container">
        <p>Or let them scan this QR code for ${window.location.host}</p>
        <img alt="QR code" src=${this.shareableFallbackQR} />
      </div>
    `
  }

  render() {
    return html`
      <npchat-modal ?canClose=${true}>
        <div class="container">
          ${this.showFallback ? this.fallbackTemplate() : this.normalTemplate()}
          <p>
            Share this with others, and scan/copy theirs. When you both have the
            other's shareable, you can chat. This process is necessary to
            securely trade keys.
          </p>
          <label class="no-flex">
            <input
              type="checkbox"
              ?checked=${this.showFallback}
              @change=${this.handleShowFallbackChange}
            />
            <span>Show fallback for older browsers</span>
          </label>
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
    const data = this.showFallback
      ? this.shareableFallback
      : this.shareableProtocolURL
    await navigator.clipboard.writeText(data)
  }

  handleShowFallbackChange(e) {
    this.showFallback = e.path[0].checked
  }
}
