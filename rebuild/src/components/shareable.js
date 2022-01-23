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
        <div class="monospace">${this.shareableURL}</div>
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
}
