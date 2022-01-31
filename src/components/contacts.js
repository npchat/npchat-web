import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { avatarFallbackURL } from "./app.js"
import { formStyles } from "../styles/form.js"
import { fetchShareableUsingURLData, protocolScheme } from "../core/shareable.js"
import { openDBConn } from "../core/db.js";

export class Contacts extends LitElement {
  static get properties() {
    return {
      contacts: { type: Array },
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
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .import {
          display: flex;
          position: sticky;
          top: 0;
          min-height: 60px;
          background-color: var(--color-offwhite);
        }

        input {
          margin: 5px;
          flex-grow: 1;
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
    this.contacts = []
    window.addEventListener("messageReceived", async event => {
      const msg = event.detail
      if (this.selected?.keys.pubKeyHash === event.detail.with) return
      // notify if contact not selected
      const preview = `${msg.m.slice(0, 25)}${
        msg.m.length > 25 ? "..." : ""
      }`
      this.toast.show(`${msg.displayName}: ${preview}`)
    })
    window.addEventListener("socketConnected", () => this.init())
  }

  async init() {
    this.db = await openDBConn()
    await this.loadContacts()
    // import from URL
    const toImport = await fetchShareableUsingURLData()
    if (toImport && toImport.originURL && toImport.keys) {
      this.addContact(toImport)
    }
    await this.updateContacts()
    await this.loadContacts()
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
        @change=${this.handleChange}
      />
    </div>
    <div class="list">
      ${this.filterContacts().map(c => this.contactTemplate(c))}
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

  async updateContacts() {
    const contacts = await this.db.getAll("contacts")
    await Promise.all(contacts.map(async c => {
      try {
        const resp = await fetch(`${c.originURL}/${c.keys.pubKeyHash}/shareable`)
        if (resp.status !== 200) return
        const { displayName, avatarURL, originURL, keys } = await resp.json()
        const updated = {}
        Object.assign(updated, c) // assign old values
        Object.assign(updated, {displayName, avatarURL, originURL})
        if (!updated.keys.auth) {
          // only add keys we don't already have them
          // this only happens when contacts are synced
          Object.assign(updated, {keys})
        }
        return this.db.put("contacts", updated, c.keys.pubKeyHash)
      } catch {
        return Promise.resolve()
      }
    }))
  }

  select(contact) {
    this.selected = contact
    this.chat?.setContact(contact)
  }

  handleInput(e) {
    const input = e.target
    let { value } = input
    if (!value.startsWith(protocolScheme)) {
      this.filter = value.toLowerCase()
    }
  }

  async handleChange(e) {
    const input = e.target
    let { value } = input
    if (!value.startsWith(protocolScheme)) {
      return
    }
    this.filter = ""
    value = value
      .replace(`${protocolScheme}:`, "")
    try {
      const resp = await fetch(value)
      if (resp.status !== 200) return
      const shareableData = await resp.json()
      if (
        shareableData.originURL &&
        shareableData.keys &&
        shareableData.displayName
      ) {
        await this.addContact(shareableData)
        await this.loadContacts()
        input.value = ""
        input.classList.add("success")
        setTimeout(() => {
          input.classList.remove("success")
        }, 500)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async addContact(data) {
    await this.db.put("contacts", data, data.keys.pubKeyHash)
    this.toast.show(`Imported contact: ${data.displayName}`)
  }

  filterContacts() {
    if (!this.contacts) return []
    if (!this.filter) {
      return this.contacts
    }
    return [...this.contacts].filter(
      c => JSON.stringify(c).toLowerCase().indexOf(this.filter) > -1
    )
  }
}
