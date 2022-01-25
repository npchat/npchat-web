import { LitElement, html, css } from "lit"
import { generalStyles } from "../styles/general.js"

export class Toast extends LitElement {

  static get properties() {
    return {
      message: {}
    }
  }

  static get styles() {
    return [
      css`
        .container {
          width: 100vw;
          display: flex;
          justify-content: center;
          pointer-events: none;
          position: fixed;
          bottom: -80px;
          max-height: 76px;
          left: 0;
          opacity: 0;
          transition: all 500ms;
        }

        .container.active {
          bottom: -2px;
          opacity: 1;
        }

        .toast {
          padding: 20px;
          font-size: 1.2rem;
          background-color: var(--color-darkwhite);
          max-width: 80vw;
          border: 2px solid;
        }
      `,
      generalStyles
    ]
  }

  constructor() {
    super()
    this.message = ""
  }

  render() {
    return html`
    <div class="container">
      <div class="toast border-gradient">
        ${this.message}
      </div>
    </div>
    `
  }

  show(message, timeout) {
    this.message = message
    if (!this.active) {
      this.container.classList.add("active")
      this.active = true
      setTimeout(() => {
        this.container.classList.remove("active")
        this.active = false
      }, timeout || 2000)
    }
    
  }

  get container() {
    return this.renderRoot?.querySelector(".container") ?? null
  }
  
}
