import { LitElement, html, css } from "lit"

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
          bottom: -100px;
          left: 0;
          opacity: 0;
          transition: bottom, opacity 300ms;
        }

        .container.active {
          bottom: -2px;
          opacity: 1;
        }

        .toast {
          padding: 20px;
          font-size: 1.2rem;
          background-color: var(--color-darkwhite);
          border: 2px solid var(--color-primary);
          max-width: 80vw;
        }
      `
    ]
  }

  constructor() {
    super()
    this.message = ""
  }

  render() {
    return html`
    <div class="container">
      <div class="toast">
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
