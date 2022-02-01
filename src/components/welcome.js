import { LitElement, html, css } from "lit"
import { unpack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { generateKeys } from "../core/keys.js"
import { fromBase64 } from "../util/base64.js"
import { importUserData } from "../core/export.js"
import { resizeImageFile } from "../util/image.js"
import { avatarSize, putMedia } from "../core/media.js"

const defaultOriginURL = "https://axl.npchat.org"
const defaultDisplayName = "Anonymous"

export class Welcome extends LitElement {
  static get properties() {
    return {
      slideNumber: { type: Number },
      showImportForm: { type: Boolean },
      importErrorMessage: {},
    }
  }

  static get styles() {
    return [
      css`
      form {
        margin: 10px;
      }
      
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

  get avatarFileInput() {
    return this.renderRoot.getElementById("avatar-file")
  }

  constructor() {
    super()
    this.slideNumber = 0
    this.showImportForm = false
  }

  welcomeFormTemplate() {
    return html`
      <form ?hidden=${this.showImportForm} @submit=${this.handleWelcomeSubmit}>
        <div ?hidden=${this.slideNumber !== 0}>
          <h1>Welcome to npchat</h1>
          <h2>Let's get you set up</h2>
          <p ?hidden=${this.browserSupportsProtocolHandlers()}>
            It looks like your browser doesn't support some modern web APIs. For
            the best experience,
            ${this.browserUsesChromium()
              ? "update your browser"
              : "switch to Brave or Google Chrome"}.
          </p>
          <div class="flex">
            <label>
              <span>Your display name</span>
              <input
                type="text"
                name="displayName"
                placeholder=${defaultDisplayName}
              />
            </label>
            <p class="color-light">Optional</p>
            <label>
              <span>Your avatar</span>
              <input
                type="file"
                id="avatar-file"
                name="avatarFile"
                accept="image/png, image/jpeg"
              />
            </label>
            <label>
              <span>Your origin URL</span>
              <input
                list="origins"
                name="originURL"
                .placeholder=${defaultOriginURL}
              />
              <datalist id="origins">
                <option value="https://axl.npchat.org"></option>
                <option value="https://frosty-meadow-296.fly.dev"></option>
                <option value="https://wispy-feather-9047.fly.dev"></option>
                <option value="https://dev.npchat.org:8000"></option>
              </datalist>
              <p>
                Optionally point to your own self-hosted instance. Check the
                <a
                  href="https://npchat.org/docs"
                  target="_blank"
                  class="link"
                  tabindex="-1"
                  >docs</a
                >
                for guidance.
              </p>
            </label>
            <button
              type="button"
              class="normal"
              @click=${() => (this.slideNumber += 1)}
            >
              Continue
            </button>
            <p class="color-light">Alternatively</p>
            <button
              type="button"
              @click=${() => (this.showImportForm = true)}
              class="normal"
            >
              Import
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
    `
  }

  importFormTemplate() {
    return html`
      <form ?hidden=${!this.showImportForm} @submit=${this.handleImportSubmit}>
        <button
          type="button"
          @click=${() => (this.showImportForm = false)}
          class="icon"
        >
          <img alt="back" src="assets/icons/arrow_back.svg" />
        </button>
        <h2>Import</h2>
        <p>
          Import your keys from another browser or device. This will allow you
          to connect to the same inbox.
        </p>
        <div class="flex">
          <label>
            <span>Import data</span>
            <input
              type="text"
              name="importData"
              placeholder="Paste import data"
            />
          </label>
          <p ?hidden=${!this.importErrorMessage} class="error">
            ${this.importErrorMessage}
          </p>
          <button type="submit" class="normal">Submit</button>
        </div>
      </form>
    `
  }

  render() {
    return html`
    ${this.welcomeFormTemplate()}
    ${this.importFormTemplate()}
    `
  }

  async handleWelcomeSubmit(event) {
    event.preventDefault()
    const detail = Object.fromEntries(new FormData(event.target))
    if (detail.displayName === "") {
      detail.displayName = defaultDisplayName
    }

    detail.originURL = detail.originURL || defaultOriginURL

    if (detail.avatarFile.size > 0) {
      const resizedBlob = await resizeImageFile(
        detail.avatarFile,
        avatarSize,
        avatarSize
      )
      detail.avatarURL = await putMedia(resizedBlob, "image/jpeg")
    }
    detail.avatarFile = undefined
    this.avatarFileInput.value = ""

    detail.keys = await generateKeys()
    this.dispatchEvent(new CustomEvent("formSubmit", { detail }))
  }

  async handleImportSubmit(event) {
    event.preventDefault()
    const { importData } = Object.fromEntries(new FormData(event.target))

    if (importData === "") {
      this.importErrorMessage = "Missing import data"
    }

    try {
      const bytes = fromBase64(importData)
      const unpacked = unpack(bytes)
      const userData = await importUserData(unpacked)
      this.dispatchEvent(
        new CustomEvent("formSubmit", {
          detail: userData,
        })
      )
    } catch (err) {
      console.log(err)
      this.importErrorMessage = "Failed to import data"
    }
  }

  browserSupportsProtocolHandlers() {
    return typeof navigator.registerProtocolHandler === "function"
  }

  browserUsesChromium() {
    if (!navigator.userAgentData) return false
    return (
      navigator.userAgentData.brands.filter(
        b =>
          b.brand.toLowerCase() === "chromium" && parseInt(b.version, 10) >= 97
      ).length > 0
    )
  }
}
