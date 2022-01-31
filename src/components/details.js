import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { openDBConn } from "../core/db.js"
import { avatarFallbackURL } from "./app.js"

export class Details extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
    }
  }

  static get styles() {
    return [
      formStyles,
      css`
        .container {
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          align-items: center;
          padding: 3px;
          position: sticky;
          top: 0;
          min-height: 50px;
          background-color: var(--color-offwhite);
          filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
        }

        .avatar {
          width: 40px;
          height: 40px;
          margin-left: 5px;
          border-radius: 50%;
          border: 2px solid var(--color-secondary);
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }

        .avatarNameGroup {
          flex-grow: 1;
          display: flex;
          align-items: center;
          border-radius: 5px;
          margin: 0 5px;
          padding: 3px 0;
        }
      `,
    ]
  }

  constructor() {
    super()
    this.init()
  }

  headerTemplate() {
    if (!this.contact) return
    return html`
      <div class="header">
        <button @click=${this.clearContact} class="icon">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </button>
        <div class="avatarNameGroup">
          <img
            alt="${this.contact.displayName}"
            src=${this.contact.avatarURL || avatarFallbackURL}
            class="avatar"
          />
          <span class="name">${this.contact.displayName}</span>
        </div>
      </div>
    `
  }

  render() {
    return html`
      <div class="container">
        ${this.headerTemplate()}
        <h1>Contact details</h1>
      </div>
    `
  }

  async init() {
    this.db = await openDBConn()
  }
}
