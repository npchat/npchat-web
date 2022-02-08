import { LitElement, html } from "lit"
import { formStyles } from "../../styles/form.js"
import { detailsStyles } from "./styles.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"
import { openDBConn } from "../../core/db.js"
import { push } from "../../core/websocket.js"
import { buildDataToSync } from "../../core/sync.js"
import { buildShareableURL } from "../../core/shareable.js"
import { goToRoute } from "../router/router.js"

export class Details extends LitElement {
  static get properties() {
    return {
      contact: { type: Object },
      shareableURL: {},
    }
  }

  static get styles() {
    return [formStyles, generalStyles, detailsStyles]
  }

  headerTemplate() {
    if (!this.contact) return
    const chatRoute = `/chat/${this.contact.keys.pubKeyHash}`
    return html`
      <npc-toolbar>
        <npc-route-link route=${chatRoute} class="button icon back">
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </npc-route-link>
        <span class="name">${this.contact.displayName}</span>
      </npc-toolbar>
    `
  }

  willUpdate() {
    this.shareableURL = buildShareableURL(
      this.contact.originURL,
      this.contact.keys.pubKeyHash
    )
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
          <div class="monospace">${this.shareableURL}</div>
          <button class="button error" @click=${this.deleteContact}>
            Delete ${this.contact.displayName}
          </button>
        </div>
      </div>
    `
  }

  async deleteContact() {
    const message = `Deleting contact ${this.contact.displayName}... are you sure?`
    if (!window.confirm(message)) return
    const db = await openDBConn()
    await db.delete("contacts", this.contact.keys.pubKeyHash)
    db.close()
    push({ data: await buildDataToSync() })
    window.dispatchEvent(new CustomEvent("contactsChanged"))
    goToRoute("/")
  }
}
