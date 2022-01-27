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

  get toast() {
    return this.renderRoot?.querySelector("npchat-toast") ?? null
  }

  constructor() {
    super()
    this.init()

    window.addEventListener("focus", () => this.init())
  }

  async init() {
    if (this.isWebSocketConnected && this.socket?.readyState === WebSocket.OPEN) return
    const wasImported = await importUserDataFromURL()
    if (wasImported) {
      this.toast.show("Your keys were imported")
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
    return this.connectWebSocket()
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
    storeUser(e.detail)
    this.hideWelcome()
    this.hidePreferences()
    // push new shareableData to current origin
    Object.assign(this, e.detail)
    this.push({
      data: pack({
        displayName: this.displayName,
        avatarURL: this.avatarURL,
        contacts: await this.db.getAll("contacts")
      }),
      shareableData: this.buildShareableData(),
    })
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
    if (!this.isWebSocketConnected) return
    this.socket.send(pack(object))
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
      socket.addEventListener("message", e => handleIncomingMessage(e, this.db, this.keys))
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
        const unpacked = unpack(authResp.data)
        const { displayName, avatarURL, contacts } = unpacked
        if (displayName) {
          storeUser({ displayName, avatarURL })
          Object.assign(this, { displayName, avatarURL });
        }
        (contacts || []).map(c => {
          this.db.put("contacts", c, c.keys.pubKeyHash)
        })
      }
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      socket.send(
        pack({
          // double-pack to prevent unmarshalling by server
          data: pack({
            displayName: this.displayName,
            avatarURL: this.avatarURL,
            contacts: []
          }),
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
