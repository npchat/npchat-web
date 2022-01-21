import { LitElement, html, css } from "lit"
import { loadPreferences, storePreferences } from "../util/storage.js"

const logo = new URL("../../assets/npchat-logo.svg", import.meta.url).href

export class App extends LitElement {
  static get properties() {
    return {
      blur: {type: Boolean},
      showWelcome: {type: Boolean},
      showPreferences: {type: Boolean},
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

      .blur {
				height: 100vh;
				width: 100vw;
				position: fixed;
				top: 0;
				left: 0;
				z-index: 1;
				filter: blur(10px);
				background-color: var(--color-offwhite);
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
    Object.assign(this, loadPreferences())
    this.blur = this.showWelcome || this.showPreferences
  }

  render() {
    return html`
      <main class="${this.blur ? "blur" : ""}">
        <header>
          <img alt="npchat logo" src=${logo} class="logo"/>
          <a href="#" @click=${this.handleShowPreferences} class="preferences-button">
            <img alt="avatar" src=${this.avatarURL} class="avatar"/>
          </a>
        </header>
        <h1>npchat-web</h1>
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

  handlePreferencesSubmit(e) {
    Object.assign(this, e.detail)
    storePreferences(e.detail)
    this.hideWelcome()
    this.hidePreferences()
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
