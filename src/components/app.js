import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { styleMap } from "lit/directives/style-map.js"
import { pack, unpack } from "msgpackr"
import { loadPreferences, storePreferences } from "../util/storage.js"
import { getWebSocket, authenticateSocket } from "../util/websocket.js"
import { subscribeToPushNotifications } from "../util/webpush.js"
import { generateQR } from "../util/qrcode.js"
import {
  registerProtocolHandler,
  fetchUsingURLData,
  buildShareableURL,
} from "../util/shareable.js"
import { fromBase64, toBase64 } from "../util/base64.js"
import { openDBConn } from "../util/db.js"
import { handleIncomingMessage } from "../util/incoming.js"

export const logoURL = "assets/npchat-logo.svg"
export const avatarFallbackURL = "assets/avatar.svg"

export class App extends LitElement {
  static get properties() {
    return {
      showWelcome: { type: Boolean },
      showPreferences: { type: Boolean },
      showShareable: { type: Boolean },
      isWebSocketConnected: { type: Boolean },
      displayName: {},
      avatarURL: {},
      originURL: {},
      shareableQR: {}
    }
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }

      main {
        transition: filter 300ms;
      }

      main.blur {
        filter: blur(10px);
      }

      header {
        width: 100vw;
        height: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-darkwhite);
      }

      .logo {
        height: 100%;
        width: auto;
        margin: 0 5px;
      }

      .avatar {
        height: 40px;
        width: 40px;
        background-size: cover;
        border-radius: 50%;
        border: 2px solid var(--color-grey);
        transition: border-color 300ms;
      }

      .buttonRound {
        margin: 0 5px;
        outline: none;
        border: none;
      }

      .buttonRound:hover .avatar,
      .buttonRound:focus .avatar {
        border-color: var(--color-primary);
      }
    `
  }

  get toast() {
    return this.renderRoot?.querySelector("npchat-toast") ?? null
  }

  constructor() {
    super()
    window.toBase64 = toBase64
    window.fromBase64 = fromBase64
    this.init()
  }

  async init() {
    registerProtocolHandler()
    const pref = await loadPreferences()
    Object.assign(this, pref)
    if (!this.originURL || !this.keys) {
      return 
    }

    this.db = await openDBConn()

    // connect to origin
    await this.connectWebSocket()

    // make QR
    const shaereableURL = buildShareableURL(
      this.originURL,
      this.keys.pubKeyHash
    )
    this.shareableQR = await generateQR(shaereableURL)

    await this.checkContacts()

    // import from URL
    const toImport = await fetchUsingURLData()
    if (toImport && toImport.originURL && toImport.keys) {
      this.addContact(toImport)
    }
  }

  render() {
    const qrImgUrl = this.shareableQR && `url(${this.shareableQR})`
    const shouldBlur =
      this.showWelcome || this.showPreferences || this.showShareable
    return html`
      <main class="${classMap({ blur: shouldBlur })}">
        <header>
          <img alt="npchat logo" src=${logoURL} class="logo" />
          <npchat-status
            ?isWebSocketConnected=${this.isWebSocketConnected}
          ></npchat-status>
          <button
            href="#"
            @click=${this.handleShowShareable}
            class="buttonRound"
          >
            <div
              class="avatar"
              style=${styleMap({ backgroundImage: qrImgUrl })}
            ></div>
          </button>
          <button @click=${this.handleShowPreferences} class="buttonRound">
            <img
              alt="avatar"
              src=${this.avatarURL || avatarFallbackURL}
              class="avatar"
            />
          </button>
        </header>
        <npchat-contacts .keys=${this.keys}></npchat-contacts>
      </main>

      <npchat-toast></npchat-toast>

      <npchat-welcome
        @formSubmit=${this.handlePreferencesSubmit}
        ?hidden=${!this.showWelcome}
      ></npchat-welcome>

      <npchat-preferences
        @formSubmit=${this.handlePreferencesSubmit}
        @close=${this.hidePreferences}
        ?hidden=${!this.showPreferences}
        .preferences=${{
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          originURL: this.originURL,
        }}
      ></npchat-preferences>

      <npchat-shareable
        @close=${this.hideShareable}
        originURL=${this.originURL}
        pubKeyHash=${this.keys && this.keys.pubKeyHash}
        ?showQR=${true}
        ?hidden=${!this.showShareable}
      ></npchat-shareable>
    `
  }

  async handlePreferencesSubmit(e) {
    let changedOriginURL
    if (e.detail.originURL !== this.originURL) {
      changedOriginURL = true
    }
    Object.assign(this, e.detail)
    storePreferences(e.detail)
    this.shareableQR = await generateQR(
      buildShareableURL(this.originURL, this.keys.pubKeyHash)
    )
    this.hideWelcome()
    this.hidePreferences()
    // push new shareableData to current origin
    this.push({
      shareableData: this.buildShareableData(),
    })
    if (changedOriginURL) {
      // connect to new origin
      await this.connectWebSocket()
    }
  }

  hideWelcome() {
    this.showWelcome = false
    storePreferences({
      showWelcome: this.showWelcome,
    })
  }

  handleShowPreferences() {
    this.showPreferences = true
  }

  hidePreferences() {
    this.showPreferences = false
  }

  handleShowShareable() {
    this.showShareable = true
  }

  hideShareable() {
    this.showShareable = false
  }

  buildShareableData() {
    return new TextEncoder().encode(
      JSON.stringify({
        displayName: this.displayName,
        avatarURL: this.avatarURL,
        originURL: this.originURL,
        keys: {
          auth: this.keys.auth.jwk.publicKey,
          dh: this.keys.dh.jwk.publicKey,
          pubKeyHash: this.keys.pubKeyHash,
        },
      })
    )
  }

  push(object) {
    if (!this.isWebSocketConnected) return
    this.socket.send(pack(object))
  }

  addContact(shareableData) {
    this.contacts = this.contacts || {}
    const current = this.contacts[shareableData.keys.pubKeyHash]
    this.contacts[shareableData.keys.pubKeyHash] = shareableData
    storePreferences({
      contacts: this.contacts,
    })
    window.dispatchEvent(
      new CustomEvent("contactsChanged", {
        detail: this.contacts,
      })
    )
    const name = current.displayName || shareableData.displayName
    this.toast.show(
      `${current ? "Updated data for" : "Imported contact"} ${name}`
    )
  }

  async checkContacts() {
    if (!this.contacts) return
    await Promise.all(
      Object.entries(this.contacts).map(async entry => {
        const pubKeyHash = entry[0]
        const contact = entry[1]
        const resp = await fetch(`${contact.originURL}/${pubKeyHash}/shareable`)
        if (resp.status !== 200) return
        // don't update keys
        const { displayName, avatarURL, originURL } = await resp.json()
        Object.assign(this.contacts[pubKeyHash], {
          displayName,
          avatarURL,
          originURL,
        })
      })
    )
    storePreferences({
      contacts: this.contacts,
    })
    window.dispatchEvent(
      new CustomEvent("contactsChanged", {
        detail: this.contacts,
      })
    )
  }

  selectContact(contact) {
    this.selectedContact = contact
    const storedMessages = localStorage.getItem(contact.keys.pubKeyHash)
    if (!storedMessages) {
      this.selectedContactMessages = []
      return
    }
    this.selectedContactMessages = JSON.parse(storedMessages)
      .sort((a, b) => a.t - b.t)
  }

  handleMessageSent(e) {
    this.selectedContactMessages.push(e.detail)
    localStorage.setItem(
      this.selectedContact.keys.pubKeyHash,
      JSON.stringify(this.selectedContactMessages)
    )
  }

  async connectWebSocket() {
    try {
      const url = new URL(this.keys.pubKeyHash, this.originURL)
      const tStart = performance.now()
      const socket = await getWebSocket(url.toString())
      socket.addEventListener(
        "close",
        () => (this.isWebSocketConnected = false)
      )
      socket.addEventListener("message", e => handleIncomingMessage(e, this.db))
      const authResp = await authenticateSocket(
        socket,
        this.keys.auth.keyPair.privateKey,
        this.keys.auth.publicKeyRaw
      )
      const tEnd = performance.now()
      console.log("connected in", (tEnd - tStart).toPrecision(2), "ms")
      if (authResp.error) {
        this.isWebSocketConnected = false
        return Promise.reject(authResp.error)
      }
      this.isWebSocketConnected = true
      // handle data
      if (authResp.data) {
        // TODO: HANDLE DATA
        // const data = unpack(authResp.data)
        // console.log("unpacked", data)
        // smart merge with stored data (adding new contacts)
      }
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      socket.send(
        pack({
          // double-pack to prevent unmarshalling by server
          data: pack({ contacts: [] }),
          shareableData: this.buildShareableData(),
          sub: sub || "",
        })
      )
      this.socket = socket
      return Promise.resolve(socket)
    } catch (e) {
      this.isWebSocketConnected = false
      return Promise.reject(e)
    }
  }
}
