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
    window.addEventListener("messageReceived", async event => {
      const msg = event.detail
      localStorage.lastMessagePubKeyHash = msg.with
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
    await this.updateContacts()
    await this.loadContacts()

    const toSelect = this.contacts.find(c => c.keys.pubKeyHash === localStorage.lastMessagePubKeyHash)
    if (toSelect) this.select(toSelect)

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
      // don't update keys
      const { displayName, avatarURL, originURL } = await resp.json()
      const current = {}
      Object.assign(current, c)
      Object.assign(current, {displayName, avatarURL, originURL})
      return this.db.put("contacts", current, c.keys.pubKeyHash)
      } catch {
        return Promise.resolve()
      }
    }))
  }

  select(contact) {
    this.selected = contact
    this.chat?.setContact(contact)
  }

  async handleInput(e) {
    const input = e.path[0]
    let { value } = input
    if (!value.startsWith("http") && !value.startsWith(protocolScheme)) {
      this.filter = value.toLowerCase()
      return
    }
    this.filter = ""
    value = value
    .replace(" ", "") // fix scanned URL (not QR)
    .replace(`${protocolScheme}:`, "")
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
    if (!this.filter) {
      return this.contacts
    }
    return [...this.contacts].filter(
      c => JSON.stringify(c).toLowerCase().indexOf(this.filter) > -1
    )
  }
}
