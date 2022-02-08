import { LitElement, html } from "lit"
import { styleMap } from "lit/directives/style-map.js"
import { unpack } from "msgpackr"
import { importUserKeys, loadUser, storeUser } from "../../core/storage.js"
import { getWebSocket, authenticateSocket, push } from "../../core/websocket.js"
import { addNotificationClickEventListener, subscribeToPushNotifications } from "../../core/webpush.js"
import { generateQR } from "../../util/qrcode.js"
import {
  registerProtocolHandler,
  buildShareableURL,
  buildShareableData,
} from "../../core/shareable.js"
import { openDBConn } from "../../core/db.js"
import { handleIncomingMessage } from "../../core/incoming.js"
import { appStyles } from "./styles.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"
import { buildDataToSync } from "../../core/sync.js"
import { importUserDataFromURL } from "../../core/export.js"
import { goToRoute } from "../router/router.js"

export class App extends LitElement {
  static get properties() {
    return {
      isSocketConnected: { type: Boolean },
      displayName: {},
      avatarURL: {},
      originURL: {},
      shareableQR: {},
      defaultRoute: {},
    }
  }

  static get styles() {
    return [appStyles, generalStyles]
  }

  get toastComponent() {
    return this.renderRoot.querySelector("npc-toast")
  }

  get callComponent() {
    return this.renderRoot.querySelector("npc-call")
  }

  get routerComponent() {
    return this.renderRoot.querySelector("npc-router")
  }

  constructor() {
    super()
    this.defaultRoute = localStorage.originURL ? "/" : "/welcome"
    importUserDataFromURL().then(async didImport => {
      await this.init()
      if (didImport) {
        window.dispatchEvent(new CustomEvent("contactsChanged"))
        goToRoute("/")
        showToast("Imported your keys & settings")
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()
    registerProtocolHandler()
    addNotificationClickEventListener()
    window.addEventListener("callStart", this.handleCallStart)
    window.addEventListener("toast", event => this.showToast(event))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener("callStart", this.handleCallStart)
  }

  async init(force) {
    Object.assign(this, loadUser())

    if (!this.originURL) return

    if (
      !force &&
      this.isSocketConnected &&
      winsow.socket?.readyState === WebSocket.OPEN
    ) {
      return
    }

    Object.assign(this.keys, await importUserKeys(this.keys))

    const shaereableURL = buildShareableURL(
      this.originURL,
      this.keys.pubKeyHash
    )
    this.shareableQR = await generateQR(shaereableURL, {
      errorCorrectionLevel: "L",
    })

    return this.connectSocket()
  }

  showToast(event) {
    this.toastComponent.show(event.detail)
  }

  headerTemplate() {
    const qrImgUrl = this.shareableQR && `url(${this.shareableQR})`
    const avatarURL = `url(${this.avatarURL || avatarFallbackURL})`
    return html`
      <header>
        <npc-route-link route="/">
          <img alt="logo" src="assets/npchat-logo.svg" class="logo" />
        </npc-route-link>
        <npc-status
          ?hidden=${!this.originURL}
          ?isSocketConnected=${this.isSocketConnected}
        ></npc-status>
        <npc-route-link route="/shareable" ?hidden=${!this.originURL}>
          <div
            class="buttonRound"
            style=${styleMap({ backgroundImage: qrImgUrl })}
          ></div>
        </npc-route-link>
        <npc-route-link route="/preferences" ?hidden=${!this.originURL}>
          <div
            class="buttonRound"
            style=${styleMap({ backgroundImage: avatarURL })}
          ></div>
        </npc-route-link>
      </header>
    `
  }

  render() {
    return html`
      ${this.headerTemplate()}
      <npc-router .default=${this.defaultRoute} basePath="/">
        <npc-welcome
          route="/welcome"
          @formSubmit=${this.handlePreferencesSubmit}
        ></npc-welcome>

        <npc-preferences
          route="/preferences"
          @formSubmit=${this.handlePreferencesSubmit}
          .preferences=${{
            displayName: this.displayName,
            avatarURL: this.avatarURL,
            originURL: this.originURL,
          }}
        ></npc-preferences>

        <npc-shareable
          route="/shareable"
          @close=${this.hideShareable}
          originURL=${this.originURL}
          pubKeyHash=${this.keys && this.keys.pubKeyHash}
        ></npc-shareable>

        <npc-chats route="/" .keys=${this.keys}> </npc-chats>
      </npc-router>

      <npc-toast></npc-toast>
      <npc-call .myKeys=${this.keys}></npc-call>
    `
  }

  async handlePreferencesSubmit(e) {
    storeUser(e.detail)
    Object.assign(this, e.detail)
    push({
      data: await buildDataToSync(),
      shareableData: buildShareableData(this.keys)
    })
    this.defaultRoute = "/"
    this.routerComponent.active = "/"
    return this.init(true)
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
    setTimeout(async () => {
      if (window.socket?.readyState === WebSocket.OPEN) {
        this.isSocketConnected = true
        return
      }
      await this.connectSocket()
    }, 2000)
  }

  async connectSocket() {
    try {
      const url = new URL(this.keys.pubKeyHash, this.originURL)
      window.socket = await getWebSocket(url.toString())
      window.socket.onclose = () => {
        this.isSocketConnected = false
        this.reconnectSocket()
      }
      window.socket.onmessage = event =>
        handleIncomingMessage(event, this.keys)
      const authResp = await authenticateSocket(
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
        const db = await openDBConn()
        let contactsChanged = false
        await Promise.all(
          contacts.map(async c => {
            if (!(await db.get("contacts", c.pubKeyHash))) {
              // fetch data from shareable
              const resp = await fetch(`${c.originURL}/${c.pubKeyHash}/shareable`)
              if (resp.status !== 200) return
              contactsChanged = true
              const data = await resp.json()
              return db.put(
                "contacts",
                data,
                c.pubKeyHash
              )
            }
          })
        )
        db.close()
        if (contactsChanged) {
          window.dispatchEvent(new CustomEvent("contactsChanged"))
        }
      }
      // push merged data
      const sub = await subscribeToPushNotifications(authResp.vapidKey)
      push({
        data: await buildDataToSync(),
        shareableData: buildShareableData(this.keys),
        sub: sub || "",
      })
      window.dispatchEvent(new CustomEvent("socketConnected"))
      return Promise.resolve(true)
    } catch (err) {
      console.log("failed to connect", err)
      this.isSocketConnected = false
      return Promise.resolve(err)
    }
  }
}

export function showToast(message) {
  window.dispatchEvent(new CustomEvent("toast", {
    detail: message
  }))
}
