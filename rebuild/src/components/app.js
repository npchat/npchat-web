import { LitElement, html, css } from "lit"
import { loadPreferences, storePreferences } from "../util/preferences.js"

const logo = new URL("../../assets/npchat-logo.svg", import.meta.url).href

export class App extends LitElement {
  static get properties() {
    return {
      blur: {type: Boolean},
      showWelcome: {type: Boolean},
      displayName: {},
      avatarURL: {},
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
        height: 100%;
        width: auto;
        border-radius: 50%;
        border: 2px solid var(--color-lightgrey);
      }

      .avatar:hover {
        border-color: var(--color-secondary);
      }

      .preferences-button {
        height: 40px;
        margin: 0 5px;
      }
    `
  }

  constructor() {
    super()
    Object.assign(this, loadPreferences())
    this.blur = this.showWelcome
  }

  render() {
    return html`
      <main class="${this.blur ? "blur" : undefined}">
        <header>
          <img alt="npchat logo" src=${logo} class="logo"/>
          <a href="#" class="preferences-button">
            <img alt="avatar" src=${this.avatarURL} class="avatar"/>
          </a>
        </header>
        <h1>npchat-web</h1>
      </main>

      <npchat-welcome
          @welcomeSubmit=${this.handleWelcomeSubmit}
          @welcomeDismiss=${this.hideWelcome}
          ?hidden=${!this.showWelcome}
        ></npchat-welcome>
    `
  }

  handleWelcomeSubmit(e) {
    console.log("details", e.detail)
    Object.assign(this, e.detail)
    storePreferences(e.detail)
    this.hideWelcome()
  }

  hideWelcome() {
    this.showWelcome = false
    this.blur = false
    this.requestUpdate('showWelcome')
    storePreferences({
      showWelcome: this.showWelcome,
    })
  }
}
