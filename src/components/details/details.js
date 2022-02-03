import { LitElement, html } from "lit"
import { formStyles } from "../../styles/form.js"
import { detailsStyles } from "./styles.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"

export class Details extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
    }
  }

  static get styles() {
    return [
      formStyles,
      generalStyles,
      detailsStyles,
    ]
  }

  headerTemplate() {
    if (!this.contact) return
    const chatRoute = `/chat/${this.contact.keys.pubKeyHash}`
    return html`
      <div class="header">
        <npchat-route-link route=${chatRoute} class="button icon">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </npchat-route-link>
        <span class="name">${this.contact.displayName}</span>
      </div>
    `
  }

  render() {
    return html`
      <div class="container">
        ${this.headerTemplate()}
        <div class="main">
          <img
              alt="${this.contact.displayName}"
              src=${this.contact.avatarURL || avatarFallbackURL}
              class="avatar fullsize"
          />
          <button class="button error">Delete</button>
        </div>
      </div>
    `
  }
}
