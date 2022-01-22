import { LitElement, html, css } from "lit"
import {classMap} from "lit/directives/class-map.js"
import { loadPreferences, storePreferences } from "../util/storage.js"
import { getWebSocket, authenticateSocket } from "../util/websocket.js"

const logo = new URL("../../assets/npchat-logo.svg", import.meta.url).href

export class App extends LitElement {
  static get properties() {
    return {
      blur: {type: Boolean},
      showWelcome: {type: Boolean},
      showPreferences: {type: Boolean},
      isWebSocketConnected: {type: Boolean},
      displayName: {},
      avatarURL: {},
      originURL: {}
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
        border-radius: 50%;
        border: 2px solid var(--color-grey);
        transition: border-color 300ms;
      }

      .avatar:hover {
        border-color: var(--color-secondary);
      }

      .preferences-button {
        margin: 0 5px;
      }
    `
  }

  constructor() {
    super()
    loadPreferences().then(pref => {
      Object.assign(this, pref)
      this.blur = this.showWelcome
      try {
        this.connectWebSocket().then(() => {
          this.isWebSocketConnected = true
        })
      } catch (e) {
        this.isWebSocketConnected = false
      }
    })
    
  }

  async connectWebSocket() {
    if (!this.originURL || !this.keys) {
      console.error("missing stuff", this.originURL, this.keys)
      return Promise.reject()
    }
    const url = new URL(this.keys.pubKeyHash, this.originURL)
    const socket = await getWebSocket(url.toString())
    return authenticateSocket(socket, this.keys.auth.keyPair.privateKey, this.keys.auth.raw.publicKey)
  }

  render() {
    return html`
      <main class="${classMap({blur: this.blur})}">
        <header>
          <img alt="npchat logo" src=${logo} class="logo"/>
          <npchat-status ?isWebSocketConnected=${this.isWebSocketConnected}></npchat-status>
          <a href="#" @click=${this.handleShowPreferences} class="preferences-button">
            <img alt="avatar" src=${this.avatarURL} class="avatar"/>
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
      ></npchat-welcome>
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
      await this.connectWebSocket()
    }
  }

  hideWelcome() {
    this.showWelcome = false
    this.blur = false
    storePreferences({
      showWelcome: this.showWelcome,
    })
  }

  handleShowPreferences(e) {
    e.preventDefault()
    this.showPreferences = true
    this.blur = true
  }

  hidePreferences() {
    this.showPreferences = false
    this.blur = false
  }
}
