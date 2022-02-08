import { LitElement, html } from "lit"
import { formStyles } from "../../styles/form.js"
import {
  fetchShareableUsingURLData,
  protocolScheme,
} from "../../core/shareable.js"
import { openDBConn } from "../../core/db.js"
import { chatsStyles } from "./styles.js"
import { avatarFallbackURL } from "../../styles/general.js"
import { push } from "../../core/websocket.js"
import { buildDataToSync } from "../../core/sync.js"
import { showToast } from "../app/app.js"

export class Chats extends LitElement {
  static get properties() {
    return {
      contacts: { type: Array },
      filter: {},
      keys: { type: Object },
    }
  }

  static get styles() {
    return [formStyles, chatsStyles]
  }

  get chat() {
    return this.renderRoot.querySelector("npc-chat")
  }

  get router() {
    return this.renderRoot.querySelector("npc-router")
  }

  constructor() {
    super()
    this.contacts = []
    

    this.init()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener("messageReceived", event => this.handleMessageReceived(event))
    window.addEventListener("contactsChanged", () => this.loadContacts())
  }

  async handleMessageReceived(event) {
    const msg = event.detail
    if (this.selected?.keys.pubKeyHash === event.detail.with) return
    // notify if contact not selected
    const preview = `${msg.m.slice(0, 25)}${msg.m.length > 25 ? "..." : ""}`
    showToast(`${msg.displayName}: ${preview}`)
  }

  async init() {
    await this.loadContacts()

    // import from URL
    const toImport = await fetchShareableUsingURLData()
    if (toImport && toImport.originURL && toImport.keys) {
      this.addContact(toImport)
    }

    await this.updateContacts()
  }

  contactTemplate(contact) {
    const route = `/chat/${contact.keys.pubKeyHash}`
    return html`
      <npc-route-link route=${route}>
        <div class="contact">
          <img
            alt="${contact.displayName}"
            src=${contact.avatarURL || avatarFallbackURL}
            class="avatar"
          />
          <span class="name">${contact.displayName}</span>
        </div>
      </npc-route-link>
    `
  }

  contactListTemplate() {
    return html`
      <div route="/">
        <npc-toolbar>
          <input
            type="text"
            placeholder="search or import"
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
        </npc-toolbar>
        <div class="list">
          ${this.filterContacts().map(c => this.contactTemplate(c))}
        </div>
      </div>
    `
  }

  render() {
    return html`
      <div class="container">
        <npc-router default="/" basePath="/">
          ${this.contactListTemplate()}
          <npc-chat route="/chat/" .keys=${this.keys}></npc-chat>
        </npc-router>
      </div>
    `
  }

  async loadContacts() {
    const db = await openDBConn()
    this.contacts = await db.getAll("contacts")
    db.close()
    this.requestUpdate()
  }

  async updateContacts() {
    const db = await openDBConn()
    const contacts = await db.getAll("contacts")
    await Promise.all(
      contacts.map(async c => {
        try {
          const resp = await fetch(
            `${c.originURL}/${c.keys.pubKeyHash}/shareable`
          )
          if (resp.status !== 200) return
          const { displayName, avatarURL, originURL, keys } = await resp.json()
          const updated = {}
          Object.assign(updated, c) // assign old values
          Object.assign(updated, { displayName, avatarURL, originURL })
          if (!updated.keys.auth) {
            // only add keys we don't already have them
            // this only happens when contacts are synced
            Object.assign(updated, { keys })
          }
          await db.put("contacts", updated, c.keys.pubKeyHash)
        } catch {
          return Promise.resolve()
        }
      })
    )
    db.close()
    window.dispatchEvent(new CustomEvent("contactsChanged"))
  }

  handleInput(e) {
    const input = e.target
    const { value } = input
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
    value = value.replace(`${protocolScheme}:`, "")
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
    const db = await openDBConn()
    await db.put("contacts", data, data.keys.pubKeyHash)
    db.close()
    push({ data: await buildDataToSync() })
    window.dispatchEvent(new CustomEvent("contactsChanged"))
    showToast(`Imported contact: ${data.displayName}`)
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

  canAccess() {
    return !!localStorage.originURL
  }
}
