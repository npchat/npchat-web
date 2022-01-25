import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { avatarFallbackURL } from "./app.js"
import { formStyles } from "../styles/form.js"
import { protocolScheme } from "../util/shareable.js"
import { openDBConn } from "../util/db.js";

export class Contacts extends LitElement {
  static get properties() {
    return {
      contacts: { type: Object },
      selected: { type: Object },
      filter: {},
      keys: {type: Object}
    }
  }

  static get styles() {
    return [
      formStyles,
      css`
        .container {
          margin: 5px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        input {
          margin-bottom: 5px;
        }

        .list {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .contact {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          text-decoration: none;
          color: var(--color-black);
          background-color: var(--color-offwhite);
          transition: background-color 300ms;
          padding: 5px;
          margin: 0;
          border: none;
        }

        .contact:hover,
        .contact.selected {
          background-color: var(--color-darkwhite);
        }

        .contact.selected .avatar {
          border-color: var(--color-secondary);
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
    this.filter = ""
    window.addEventListener("contactsChanged", () => {
      this.requestUpdate()
    })
    this.init()
  }

  async init() {
    this.db = await openDBConn()
    await this.loadContacts()
  }

  contactTemplate(contact) {
    const isSelected =
      contact.keys.pubKeyHash === this.selected?.keys.pubKeyHash
    return html`
      <button
        class="contact ${classMap({ selected: isSelected })}"
        @click=${() => this.selected = contact}
      >
        <img
          alt="${contact.displayName}"
          src=${contact.avatarURL || avatarFallbackURL}
          class="avatar"
        />
        <span class="name">${contact.displayName}</span>
      </button>
    `
  }

  filterContacts() {
    if (!this.contacts) return []
    const entries = Object.entries(this.contacts)
    if (!this.filter) {
      return entries
    }
    return entries.filter(
      entry => JSON.stringify(entry[1]).indexOf(this.filter) > -1
    )
  }

  render() {
    return html`
      <div class="container">
        <div class="import">
          <input
            type="text"
            placeholder="search or import"
            @input=${this.handleInput}
          />
        </div>
        <div class="list">
          ${this.filterContacts().map(entry => this.contactTemplate(entry[1]))}
        </div>
        <npchat-chat
          .shareable=${this.selected}
          .myKeys=${this.keys}
        ></npchat-chat>
      </div>
    `
  }

  async loadContacts() {
    this.contacts = await this.db.getAll("contacts")
  }

  async handleInput(e) {
    const input = e.path[0]
    let { value } = input
    if (!value.startsWith("http") && !value.startsWith(protocolScheme)) {
      this.filter = value
      return
    }
    this.filter = ""
    value = value.replace(`${protocolScheme}:`, "")
    try {
      const resp = await fetch(value)
      const shareableData = await resp.json()
      if (
        shareableData.originURL &&
        shareableData.keys &&
        shareableData.displayName
      ) {
        await this.db.put("contacts", shareableData, shareableData.keys.pubKeyHash)
        await this.loadContacts()
        input.value = ""
        input.classList.add("success")
        setTimeout(() => {
          input.classList.remove("success")
        }, 500)
      }
    } catch (error) {
      console.log("invalid shareable", error)
    }
  }
}
