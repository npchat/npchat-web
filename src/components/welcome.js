import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { generateKeys } from "../core/keys.js"

export class Welcome extends LitElement {
  static get properties() {
    return {
      slideNumber: { type: Number },
    }
  }

  static get styles() {
    return [
      css`
        .flex {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        p {
          font-size: 1.2rem;
        }

        img {
          height: 200px;
          margin: 10px 0;
        }
      `,
      formStyles,
      generalStyles,
    ]
  }

  constructor() {
    super()
    this.slideNumber = 0
  }

  fingerprintTemplate() {
    return html``
  }

  render() {
    return html`
      <npchat-modal ?canClose=${false}>
        <form @submit=${this.handleSubmit}>
          <div ?hidden=${this.slideNumber !== 0}>
            <h1>Welcome to npchat</h1>
            <h2>Let's get you set up</h2>
            <p ?hidden=${this.browserSupportsProtocolHandlers()}>
              It looks like your browser does support some modern web APIs. For
              the best experience,
              ${this.browserUsesChromium()
                ? "update your browser"
                : "switch to Brave or Google Chrome"}.
            </p>
            <div class="flex">
              <label>
                <span>Your display name</span>
                <input type="text" name="displayName" placeholder="Anonymous" />
              </label>
              <p class="color-light">Optional</p>
              <label>
                <span>Your avatar URL</span>
                <input type="text" name="avatarURL" placeholder="" />
              </label>
              <button type="button" class="normal" @click=${() => (this.slideNumber += 1)}>
                Continue
              </button>
            </div>
          </div>
          <div ?hidden=${this.slideNumber !== 1}>
            <h2>Generated fresh crypto keys</h2>
            <div class="flex">
              <img alt="fingerprint" src="assets/fingerprint.svg" />
              <button type="submit" class="normal">OK</button>
            </div>
          </div>
        </form>
      </npchat-modal>
    `
  }

  async handleSubmit(e) {
    e.preventDefault()
    const detail = Object.fromEntries(new FormData(e.target))
    if (detail.displayName === "") {
      detail.displayName = "Anonymous"
    }
    // set default origin
    detail.originURL = "https://axl.npchat.org"
    // generate keys
    detail.keys = await generateKeys()
    this.dispatchEvent(new CustomEvent("formSubmit", { detail }))
  }

  browserSupportsProtocolHandlers() {
    return typeof navigator.registerProtocolHandler === "function"
  }

  browserUsesChromium() {
    return (
      navigator.userAgentData.brands.filter(
        b =>
          b.brand.toLowerCase() === "chromium" && parseInt(b.version, 10) >= 97
      ).length > 0
    )
  }
}
