import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"

export class Contacts extends LitElement {

  static get properties() {
    return {
      contacts: {type: Object},
      selected: {type: Object},
      avatarFallback: {}
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
    <a href="#" class="contact ${classMap({selected: isSelected})}" @click=${e => this.handleContactSelected(e, contact)}>
      <img alt="${contact.displayName}" src=${contact.avatarURL || this.avatarFallback} class="avatar" />
      <span class="name">${contact.displayName}</span>
    </a>
    `
  }

  render() {
    return html`
    <div class="container">
      ${Object.entries(this.contacts).map(entry => this.contactTemplate(entry[1]))}
    </div>
    `
  }

  handleContactSelected(e, contact) {
    e.preventDefault()
    console.log("selected", contact)
    this.dispatchEvent(new CustomEvent("contactSelected", {
      detail: contact
    }))
  }
  
}
