import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { avatarFallbackURL } from "./app.js"
import { formStyles } from "../styles/form.js"
import { fetchUsingURLData, protocolScheme } from "../core/shareable.js"
import { openDBConn } from "../core/db.js";

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

        .contact:hover {
          background-color: var(--color-darkwhite);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }
      `,
    ]
  }

  get chat() {
    return this.renderRoot?.querySelector("npchat-chat")
  }

  get toast() {
    return this.renderRoot?.querySelector("npchat-toast") ?? null
  }

  constructor() {
    super()
    this.filter = ""
    window.addEventListener("messageReceived", async event => {
      const msg = event.detail
      localStorage.lastMessageFrom = msg.with
      if (this.selected?.keys.pubKeyHash === event.detail.with) return
      // notify if contact not selected
      const preview = `${msg.m.slice(0, 25)}${
        msg.m.length > 25 ? "..." : ""
      }`
      this.toast.show(`${msg.displayName}: ${preview}`)
    })
    this.init()
  }

  async init() {
    this.db = await openDBConn()
    await this.loadContacts()
    this.select(this.contacts.find(c => c.keys.pubKeyHash === localStorage.lastMessageFrom))
    await this.checkContacts()
    // import from URL
    const toImport = await fetchUsingURLData()
    if (toImport && toImport.originURL && toImport.keys) {
      this.addContact(toImport)
    }
  }

  contactTemplate(contact) {
    const isSelected =
      contact.keys.pubKeyHash === this.selected?.keys.pubKeyHash
    return html`
      <button
        class="contact ${classMap({ selected: isSelected })}"
        @click=${() => this.select(contact)}
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

  contactListTemplate() {
    return html`
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
        `
  }

  render() {
    return html`
      <div class="container">
        ${this.selected ? undefined : this.contactListTemplate()}
        <npchat-chat
          ?hidden=${!this.selected}
          .myKeys=${this.keys}
          @contactCleared=${() => this.select(undefined)}
        ></npchat-chat>
      </div>
      <npchat-toast></npchat-toast>
    `
  }

  async loadContacts() {
    this.contacts = await this.db.getAll("contacts")
  }

  async checkContacts() {
    await Promise.all(this.contacts.map(async contact => {
      const resp = await fetch(`${contact.originURL}/${contact.keys.pubKeyHash}/shareable`)
      if (resp.status !== 200) return
      // don't update keys
      const { displayName, avatarURL, originURL } = await resp.json()
      const current = {}
      Object.assign(current, contact)
      Object.assign(current, {displayName, avatarURL, originURL})
      await this.db.put("contacts", current, contact.keys.pubKeyHash)
    }))
    await this.loadContacts()
    this.requestUpdate()
  }

  select(contact) {
    this.selected = contact
    this.chat?.setContact(contact)
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
      return error
    }
  }

  async addContact(data) {
    const current = await this.db.get("contacts", data.keys.pubKeyHash)
    await this.db.put("contacts", data, data.keys.pubKeyHash)
    const name = current.displayName || data.displayName
    this.toast.show(
      `${current ? "Updated data for" : "Imported contact"} ${name}`
    )
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
}
