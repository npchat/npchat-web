import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { avatarFallbackURL } from "./app.js"

export class Contacts extends LitElement {

  static get properties() {
    return {
      contacts: {type: Object},
      selected: {type: Object},
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

        .contact {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          text-decoration: none;
          color: var(--color-black);
          transition: background-color 300ms;
          padding: 5px;
          width: calc(100% - 10px);
          border: none;
        }

        .contact:hover, .contact.selected {
          background-color: var(--color-darkwhite)
        }

        .contact.selected .avatar {
          border-color: var(--color-secondary)
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          transition: border-color 300ms;
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }
      `,
    ]
  }

  constructor() {
    super()
    window.addEventListener("contactsChanged", () => {
      this.requestUpdate()
    })
  }

  contactTemplate(contact) {
    const isSelected = contact.keys.pubKeyHash === this.selected?.keys.pubKeyHash
    return html`
    <button class="contact ${classMap({selected: isSelected})}" @click=${e => this.handleContactSelected(contact)}>
      <img alt="${contact.displayName}" src=${contact.avatarURL || avatarFallbackURL} class="avatar" />
      <span class="name">${contact.displayName}</span>
    </button>
    `
  }

  render() {
    return html`
    <div class="container">
      ${this.contacts && Object.entries(this.contacts)
        .map(entry => this.contactTemplate(entry[1]))}
    </div>
    `
  }

  handleContactSelected(contact) {
    console.log("selected", contact)
    this.dispatchEvent(new CustomEvent("contactSelected", {
      detail: contact
    }))
  }
  
}
