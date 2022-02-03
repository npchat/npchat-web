import { LitElement, html } from "lit"
import { formStyles } from "../../styles/form.js"
import { detailsStyles } from "./styles.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"
import { openDBConn } from "../../core/db.js"
import { push } from "../../core/websocket.js"
import { buildDataToSync } from "../../core/sync.js"

export class Details extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
    }
  }

  static get styles() {
    return [formStyles, generalStyles, detailsStyles]
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
          <button class="button error" @click=${this.deleteContact}>Delete ${this.contact.displayName}</button>
        </div>
      </div>
    `
  }

  async deleteContact() {
    const message = `Delete contact ${this.contact.displayName}`
    if (!window.confirm(message)) return
    const db = await openDBConn()
    await db.delete("contacts", this.contact.keys.pubKeyHash)
    db.close()
    push({ data: await buildDataToSync() })
    window.dispatchEvent(new CustomEvent("contactsChanged", {
      composed: true
    }))
    window.dispatchEvent(new CustomEvent("route", {
      detail: "/",
      composed: true
    }))
  }
}
