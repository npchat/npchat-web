import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"

export class Shareable extends LitElement {

  static get properties() {
    return {
      showQR: {type: Boolean},
      shareableURL: {},
      shareableQR: {}
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

        .url {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 10px;
        }
        
        .monospace {
          font-family: monospace;
          font-size: 1.2rem;
          overflow-wrap: anywhere;
          word-break: break-all;
          user-select: all;
        }
      `,
      formStyles,
    ]
  }

  render() {
    return html`
    <npchat-modal ?canClose=${true}>
      <div class="container">
        <div class="url">
          <div class="monospace">${this.shareableURL}</div>
          <button @click=${this.handleCopy} class="button copy">Copy</button>
        </div>
        <div ?hidden=${!this.showQR}>
          <img alt="QR code" src=${this.shareableQR} />
        </div>
        <p>Share this with others, and scan/copy theirs. When you both have the other's shareable, you can chat. This process is necessary to securely trade keys.</p>
        <button @click=${this.handleClose}>Done</button>
      </div>
    </npchat-modal>
    `
  }

  handleClose(e) {
    e.preventDefault()
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true
    }))
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
