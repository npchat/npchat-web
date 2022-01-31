import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { styleMap } from "lit/directives/style-map.js"
import { pack, unpack } from "msgpackr"
import { loadUser, storeUser } from "../core/storage.js"
import { getWebSocket, authenticateSocket } from "../core/websocket.js"
import { subscribeToPushNotifications } from "../core/webpush.js"
import { generateQR } from "../util/qrcode.js"
import {
  registerProtocolHandler,
  buildShareableURL,
} from "../core/shareable.js"
import { openDBConn } from "../core/db.js"
import { handleIncomingMessage } from "../core/incoming.js"
import { importUserDataFromURL } from "../core/export.js"

export const logoURL = "assets/npchat-logo.svg"
export const avatarFallbackURL = "assets/avatar.svg"

export class App extends LitElement {
  static get properties() {
    return {
      showHeader: { type: Boolean },
      showWelcome: { type: Boolean },
      showPreferences: { type: Boolean },
      showShareable: { type: Boolean },
      isSocketConnected: { type: Boolean },
      displayName: {},
      avatarURL: {},
      originURL: {},
      shareableQR: {}
    }
  }

  static get styles() {
    return css`
      :host {
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
        max-height: 100vh;
        overflow: hidden;
      }

      header {
        width: 100vw;
        height: 60px;
        display: flex;
        position: sticky;
        top: 0;
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

  get toastComponent() {
    return this.renderRoot?.querySelector("npchat-toast") ?? null
  }

  get callComponent() {
    return this.renderRoot?.querySelector("npchat-call") ?? null
  }

  constructor() {
    super()
    this.showHeader = true
    this.init()

    //window.addEventListener("focus", () => this.init())
    window.addEventListener("callStart", e => this.handleCallStart(e))
  }

  async init() {
    if (this.isSocketConnected && this.socket?.readyState === WebSocket.OPEN) return

    const wasImported = await importUserDataFromURL()
    if (wasImported) {
      this.toastComponent.show("Your keys were imported")
      this.hideWelcome()
    }

    registerProtocolHandler()
    this.db = await openDBConn()
    const user = await loadUser()
    Object.assign(this, user)
    if (!this.originURL || !this.keys) {
      return 
    }
    const shaereableURL = buildShareableURL(
      this.originURL,
      this.keys.pubKeyHash
      )
    this.shareableQR = await generateQR(shaereableURL, {
      errorCorrectionLevel: "L"
    })

    return this.connectSocket()
  }

  headerTemplate() {
    if (!this.showHeader) return
    const qrImgUrl = this.shareableQR && `url(${this.shareableQR})`
    return html`
    <header>
      <img alt="npchat logo" src=${logoURL} class="logo" />
      <npchat-status
        ?isSocketConnected=${this.isSocketConnected}
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
    `
  }

  render() {
    const shouldBlur =
      this.showWelcome || this.showPreferences || this.showShareable
    return html`
      <main class="${classMap({ blur: shouldBlur })}">
        ${this.headerTemplate()}
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

      <npchat-call .myKeys=${this.keys}></npchat-call>
    `
  }

  async handlePreferencesSubmit(e) {
    storeUser(e.detail)
    this.hideWelcome()
    this.hidePreferences()
    Object.assign(this, e.detail)
    if (this.socket?.readyState === WebSocket.OPEN) {
      const contacts = (await this.db.getAll("contacts")).map(c => {
        return {
          originURL: c.originURL,
          pubKeyHash: c.keys.pubKeyHash
        }
      })
      this.push({
        data: pack({
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          contacts
        }),
        shareableData: this.buildShareableData(),
      })
    }
    return this.init()
  }

  hideWelcome() {
    this.showWelcome = false
    storeUser({
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
    this.socket.send(pack(object))
  }

  handleMessageSent(e) {
    this.selectedContactMessages.push(e.detail)
    localStorage.setItem(
      this.selectedContact.keys.pubKeyHash,
      JSON.stringify(this.selectedContactMessages)
    )
  }

  handleCallStart(e) {
    this.callComponent.startCall(e)
  }

  reconnectSocket() {
    this.reconnectInterval = setInterval(async () => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.isSocketConnected = true
        clearInterval(this.reconnectInterval)
        return
      }
      try {
        await this.connectSocket()
      } catch {
      }
    }, 2000)
  }

  async connectSocket() {
    try {
      const url = new URL(this.keys.pubKeyHash, this.originURL)
      this.socket = await getWebSocket(url.toString())
      this.socket.onclose = () => {
        this.isSocketConnected = false
        this.reconnectSocket()
      }
      this.socket.onmessage = event => handleIncomingMessage(event, this.db, this.keys)
      const authResp = await authenticateSocket(
        this.socket,
        this.keys.auth.keyPair.privateKey,
        this.keys.auth.publicKeyRaw
      )
      if (authResp.error) {
        throw new Error(authResp.error)
      }
      this.isSocketConnected = true
      // handle received data
      if (authResp.data) {
        const unpacked = unpack(authResp.data)
        const { displayName, avatarURL, contacts } = unpacked
        if (displayName) {
          storeUser({ displayName, avatarURL })
          Object.assign(this, { displayName, avatarURL });
        }
        console.log("receivedContacts", contacts)
        await Promise.all(contacts.map(async c => {
          if (!await this.db.get("contacts", c.pubKeyHash)) {
            return this.db.put("contacts", {
              originURL: c.originURL,
              keys: {
                pubKeyHash: c.pubKeyHash
              }
            }, c.pubKeyHash)
          }
        }))
      }
      // push merged data
      // TODO: also push when contacts are added & deleted
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      const contactsToPush = (await this.db.getAll("contacts")).map(c => {
        return {
          originURL: c.originURL,
          pubKeyHash: c.keys.pubKeyHash
        }
      })
      this.push({
        data: pack({
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          contacts: contactsToPush
        }),
        shareableData: this.buildShareableData(),
        sub: sub || "",
      })
      window.dispatchEvent(new CustomEvent("socketConnected"))
      return Promise.resolve(true)
    } catch (e) {
      this.isSocketConnected = false
      return Promise.reject(e)
    }
  }
}
