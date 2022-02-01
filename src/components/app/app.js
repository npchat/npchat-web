import { LitElement, html } from "lit"
import { classMap } from "lit/directives/class-map.js"
import { styleMap } from "lit/directives/style-map.js"
import { pack, unpack } from "msgpackr"
import { loadUser, storeUser } from "../../core/storage.js"
import { getWebSocket, authenticateSocket } from "../../core/websocket.js"
import { subscribeToPushNotifications } from "../../core/webpush.js"
import { generateQR } from "../../util/qrcode.js"
import {
  registerProtocolHandler,
  buildShareableURL,
} from "../../core/shareable.js"
import { openDBConn } from "../../core/db.js"
import { handleIncomingMessage } from "../../core/incoming.js"
import { appStyles } from "./styles.js"
import { avatarFallbackURL, logoURL } from "../../styles/general.js"

export class App extends LitElement {
  static get properties() {
    return {
      currentRoute: {},
      isSocketConnected: { type: Boolean },
      displayName: {},
      avatarURL: {},
      originURL: {},
      shareableQR: {},
    }
  }

  static get styles() {
    return appStyles
  }

  get toastComponent() {
    return this.renderRoot?.querySelector("npchat-toast")
  }

  get callComponent() {
    return this.renderRoot?.querySelector("npchat-call")
  }

  get router() {
    return this.renderRoot?.querySelector("npchat-router")
  }

  connectedCallback() {
    super.connectedCallback()

    registerProtocolHandler()

    this.addEventListener("routerNavigate", event => {
      const { route } = event.detail
      this.router.active = route
      this.currentRoute = route
    })

    // window.addEventListener("focus", () => this.init())
    window.addEventListener("callStart", event => this.handleCallStart(event))

    this.init()
  }

  async init() {
    if (this.isSocketConnected && this.socket?.readyState === WebSocket.OPEN) {
      return
    }
    const user = await loadUser()
    Object.assign(this, user)
    if (!this.originURL || !this.keys) {
      const route = "/welcome"
      this.router.active = route
      this.currentRoute = route
      history.pushState({route}, "", route)
      return
    }
    
    const shaereableURL = buildShareableURL(
      this.originURL,
      this.keys.pubKeyHash
      )
      this.shareableQR = await generateQR(shaereableURL, {
        errorCorrectionLevel: "L",
      })
      
    this.db = await openDBConn()

    return this.connectSocket()
  }

  headerTemplate() {
    const qrImgUrl = this.shareableQR && `url(${this.shareableQR})`
    return html`
    <header>
      <img alt="npchat logo" src=${logoURL} class="logo" />

      <npchat-status
        ?hidden=${this.currentRoute === "/welcome"}
        ?isSocketConnected=${this.isSocketConnected}
      ></npchat-status>

      <div ?hidden=${this.currentRoute === "/welcome"}>
        <npchat-route-link route="/">
          <h1>Chats</h1>
        </npchat-route-link>
        <npchat-route-link route="/preferences">
          <h1>Preferences</h1>
        </npchat-route-link>
        <npchat-route-link route="/shareable">
          <h1>Shareable</h1>
        </npchat-route-link>
      </div>

      <button 
        ?hidden=${this.currentRoute === "/welcome"}
        href="#" @click=${this.handleShowShareable}
        class="buttonRound">
        <div
          class="avatar"
          style=${styleMap({ backgroundImage: qrImgUrl })}
        ></div>
      </button>
      <button
        ?hidden=${this.currentRoute === "/welcome"}
        @click=${this.handleShowPreferences}
        class="buttonRound">
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
    return html`
    ${this.headerTemplate()}
    <npchat-router active=${this.route} default="/">

      <npchat-welcome route="/welcome"></npchat-welcome>

      <npchat-preferences
        route="/preferences"
        @formSubmit=${this.handlePreferencesSubmit}
        @close=${this.hidePreferences}
        .preferences=${{
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          originURL: this.originURL,
        }}
      ></npchat-preferences>

      <npchat-shareable
        route="/shareable"
        @close=${this.hideShareable}
        originURL=${this.originURL}
        pubKeyHash=${this.keys && this.keys.pubKeyHash}
      ></npchat-shareable>

      <npchat-chats
        route="/chats"
        .keys=${this.keys}>
      </npchat-chats>


    </npchat-router>
    `
    /*
    <npchat-welcome route="welcome"></npchat-welcome>
    <npchat-preferences route="preferences"></npchat-preferences>
    <npchat-contacts route="chats"></npchat-contacts>

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

    <npchat-call .myKeys=${this.keys}></npchat-call>
    `
    */
  }

  async handlePreferencesSubmit(e) {
    storeUser(e.detail)
    this.hideWelcome()
    this.hidePreferences()
    Object.assign(this, e.detail)
    if (this.socket?.readyState === WebSocket.OPEN) {
      const contacts = (await this.db.getAll("contacts")).map(c => ({
        originURL: c.originURL,
        pubKeyHash: c.keys.pubKeyHash,
      }))
      this.push({
        data: pack({
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          contacts,
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
      await this.connectSocket()
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
      this.socket.onmessage = event =>
        handleIncomingMessage(event, this.db, this.keys)
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
          Object.assign(this, { displayName, avatarURL })
        }
        await Promise.all(
          contacts.map(async c => {
            if (!(await this.db.get("contacts", c.pubKeyHash))) {
              return this.db.put(
                "contacts",
                {
                  originURL: c.originURL,
                  keys: {
                    pubKeyHash: c.pubKeyHash,
                  },
                },
                c.pubKeyHash
              )
            }
          })
        )
      }
      // push merged data
      // TODO: also push when contacts are added & deleted
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      const contactsToPush = (await this.db.getAll("contacts")).map(c => ({
        originURL: c.originURL,
        pubKeyHash: c.keys.pubKeyHash,
      }))
      this.push({
        data: pack({
          displayName: this.displayName,
          avatarURL: this.avatarURL,
          contacts: contactsToPush,
        }),
        shareableData: this.buildShareableData(),
        sub: sub || "",
      })
      window.dispatchEvent(new CustomEvent("socketConnected"))
      return Promise.resolve(true)
    } catch (err) {
      this.isSocketConnected = false
      return Promise.resolve(err)
    }
  }
}
