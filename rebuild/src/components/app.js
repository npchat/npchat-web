import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { styleMap } from 'lit/directives/style-map.js';

import { pack, unpack } from "msgpackr"
import { loadPreferences, storePreferences } from "../util/storage.js"
import { getWebSocket, authenticateSocket } from "../util/websocket.js"
import { subscribeToPushNotifications } from "../util/webpush.js"
import { generateQR } from "../util/qrcode.js"

const logo = new URL("../../assets/npchat-logo.svg", import.meta.url).href
const avatarFallback = new URL("../../assets/avatar.svg", import.meta.url).href

export class App extends LitElement {
  static get properties() {
    return {
      showWelcome: {type: Boolean},
      showPreferences: {type: Boolean},
      showShareable: {type: Boolean},
      isWebSocketConnected: {type: Boolean},
      displayName: {},
      avatarURL: {},
      originURL: {},
      shareableURL: {},
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
        background-color: var(--color-darkwhite)
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

      .button:hover .avatar, .button:focus .avatar {
        border-color: var(--color-primary);
      }

      .button {
        margin: 0 5px;
        outline: none;
      }
    `
  }

  constructor() {
    super()
    loadPreferences().then(pref => {
      Object.assign(this, pref)
      if (!this.originURL || !this.keys) {
        return
      }
      this.connectWebSocket()
      this.shareableURL = `${this.originURL}/${this.keys.pubKeyHash}/shareable`
      generateQR(this.shareableURL)
        .then(qr => this.shareableQR = qr)
    })

    const chan = new BroadcastChannel("push")
    chan.addEventListener("message", msg => {
      console.log("Message from ServiceWorkeer", msg.data)
    })
  }

  render() {
    const bgImgUrl = `url(${this.shareableQR})`
    const shouldBlur = this.showWelcome || this.showPreferences || this.showShareable
    return html`
      <main class="${classMap({blur: shouldBlur})}">
        <header>
          <img alt="npchat logo" src=${logo} class="logo"/>
          <npchat-status ?isWebSocketConnected=${this.isWebSocketConnected}></npchat-status>
          <a href="#" @click=${this.handleShowShareable} class="button">
            <div class="avatar" style=${styleMap({backgroundImage: bgImgUrl})}></div>
          </a>
          <a href="#" @click=${this.handleShowPreferences} class="button">
            <img alt="avatar" src=${this.avatarURL || avatarFallback} class="avatar"/>
          </a>
        </header>
        <h1>npchat-web</h1>
        <h2>Todo</h2>
        <ul>
          <li>Modify go-npchat for new auth mechanism</li>
        </ul>
      </main>

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
            originURL: this.originURL
          }}
        ></npchat-preferences>

      <npchat-shareable
          @close=${this.hideShareable}
          shareableURL=${this.shareableURL}
          shareableQR=${this.shareableQR}
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
    this.hideWelcome()
    this.hidePreferences()
    if (changedOriginURL) {
      // push new shareableData to old origin
      this.push({
        shareableData: this.buildShareableData()
      })
      // connect to new origin
      await this.connectWebSocket()
      this.shareableURL = this.buildShareableLink()
      this.shareableQR = await generateQR(this.shareableURL)
    }
  }

  hideWelcome() {
    this.showWelcome = false
    storePreferences({
      showWelcome: this.showWelcome,
    })
  }

  handleShowPreferences(e) {
    e.preventDefault()
    this.showPreferences = true
  }

  hidePreferences() {
    this.showPreferences = false
  }

  handleShowShareable(e) {
    e.preventDefault()
    this.showShareable = true
  }

  hideShareable() {
    this.showShareable = false
  }

  buildShareableLink() {
    return `${this.originURL}/${this.keys.pubKeyHash}/shareable`
  }

  buildShareableData() {
    return new TextEncoder().encode(JSON.stringify({
      displayName: this.displayName,
      avatarURL: this.avatarURL,
      originURL: this.originURL,
      keys: {
        auth: this.keys.auth.jwk.publicKey,
        dh: this.keys.dh.jwk?.publicKey, // TODO: remove "?"
        pubKeyHash: this.keys.pubKeyHash
      }
    }))
  }

  push(object) {
    if (!this.isWebSocketConnected) return
    this.socket.send(pack(object))
  }

  async handleMessage(msg) {
    if (!(msg.data instanceof Blob)) {
      console.log("received non-binary message, will not handle", msg.data)
      return
    }
    try {
      const arrayBuffer = await msg.data.arrayBuffer()
      const data = unpack(new Uint8Array(arrayBuffer))
      if (data.f) {
        console.log("got message", data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async connectWebSocket() {
    try {
      const url = new URL(this.keys.pubKeyHash, this.originURL)
      const tStart = performance.now()
      const socket = await getWebSocket(url.toString())
      socket.addEventListener("close", () => this.isWebSocketConnected = false)
      socket.addEventListener("message", this.handleMessage)
      const authResp = await authenticateSocket(socket, this.keys.auth.keyPair.privateKey, this.keys.auth.raw.publicKey)
      const tEnd = performance.now()
      console.log("connected in", (tEnd - tStart).toPrecision(2), "ms")
      if (authResp.error) {
        this.isWebSocketConnected = false
        return Promise.reject(authResp.error)
      }
      this.isWebSocketConnected = true
      // handle data
      if (authResp.data) {
        // const data = unpack(authResp.data)
        // console.log("unpacked", data)

        // smart merge with stored data (adding new contacts)
      }
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      socket.send(pack({
        // double-pack to prevent unmarshalling by server
        data: pack({ contacts: [] }),
        shareableData: this.buildShareableData(),
        // send sub
        sub: sub || ""
      }))
      this.socket = socket
      return Promise.resolve(socket)
    } catch (e) {
      this.isWebSocketConnected = false
      return Promise.reject(e)
    }
  }
}
