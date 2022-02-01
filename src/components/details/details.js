import { LitElement, html } from "lit"
import { formStyles } from "../../styles/form.js"
import { openDBConn } from "../../core/db.js"
import { detailsStyles } from "./styles.js"
import { avatarFallbackURL } from "../../styles/general.js"

export class Details extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
    }
  }

  static get styles() {
    return [
      formStyles,
      detailsStyles,
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
