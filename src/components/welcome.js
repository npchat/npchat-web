import { LitElement, html, css } from "lit"
import { unpack } from "msgpackr"
import { formStyles } from "../styles/form.js"
import { avatarFallbackURL, generalStyles } from "../styles/general.js"
import { generateKeys } from "../core/keys.js"
import { fromBase64 } from "../util/base64.js"
import { importUserData } from "../core/export.js"
import { resizeImageFile } from "../util/image.js"
import { avatarSize, putMedia } from "../core/media.js"
import {
  browserSupportsProtocolHandlers,
  browserUsesChromium,
} from "../core/browser.js"

const defaultOriginURL = "https://axl.npchat.org"
const defaultDisplayName = "Anonymous"

export class Welcome extends LitElement {
  static get properties() {
    return {
      slideNumber: { type: Number },
      importErrorMessage: {},
    }
  }

  static get styles() {
    return [
      css`
        p {
          font-size: 1.2rem;
        }

        .fingerprint {
          max-width: 200px;
          margin-bottom: 20px;
        }

        #avatar-file {
          margin-left: 5px;
          max-width: calc(100vw - 100px);
        }
      `,
      formStyles,
      generalStyles,
    ]
  }

  get avatarPreview() {
    return this.renderRoot.getElementById("avatar-preview")
  }

  get avatarFileInput() {
    return this.renderRoot.getElementById("avatar-file")
  }

  get router() {
    return this.renderRoot.querySelector("npc-router")
  }

  constructor() {
    super()
    this.slideNumber = 0
  }

  welcomeFormTemplate() {
    return html`
      <form route="/welcome" @submit=${this.handleWelcomeSubmit} class="main">
        <div ?hidden=${this.slideNumber !== 0}>
          <div class="flex">
            <h1>Welcome to npchat</h1>
            <h2>Let's get you set up</h2>
            <p ?hidden=${browserSupportsProtocolHandlers()}>
              It looks like your browser doesn't support some modern web APIs.
              For the best experience,
              ${browserUsesChromium()
                ? "update your browser"
                : "switch to Brave or Google Chrome"}.
            </p>
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
              <div class="row">
                <img
                  alt="avatar"
                  id="avatar-preview"
                  class="avatar"
                  src=${avatarFallbackURL}
                />
                <input
                  type="file"
                  id="avatar-file"
                  name="avatarFile"
                  accept="image/png, image/jpeg"
                  @change=${this.handleAvatarChange}
                />
              </div>
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
                Optionally point to your own self-hosted instance.<br />Check
                the
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
              class="button"
              @click=${() => (this.slideNumber += 1)}
            >
              Continue
            </button>
            <p class="color-light">Alternatively</p>

            <npc-route-link route="/welcome/import">
              <div class="button small">Import</div>
            </npc-route-link>
          </div>
        </div>
        <div ?hidden=${this.slideNumber !== 1}>
          <div class="flex">
            <h2>Generated fresh crypto keys</h2>
            <img
              class="fingerprint"
              alt="fingerprint"
              src="assets/fingerprint.svg"
            />
            <button type="submit" class="button">OK</button>
          </div>
        </div>
      </form>
    `
  }

  importFormTemplate() {
    return html`
      <form
        route="/welcome/import"
        @submit=${this.handleImportSubmit}
        class="main"
      >
        <div class="header">
          <npc-route-link route="/welcome" class="button icon back">
            <img alt="back" src="assets/icons/arrow_back.svg" />
          </npc-route-link>
          <h2>Import</h2>
        </div>
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
          <button type="submit" class="button">Submit</button>
        </div>
      </form>
    `
  }

  render() {
    return html`
      <npc-router default="/welcome" basePath="/welcome">
        ${this.welcomeFormTemplate()} ${this.importFormTemplate()}
      </npc-router>
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

  async handleAvatarChange(event) {
    const file = event.target.files[0]
    const resizedBlob = await resizeImageFile(file, 100, 100)
    this.avatarPreview.src = URL.createObjectURL(resizedBlob)
  }

  canAccess() {
    // if originURL is already set, return false
    return !localStorage.originURL
  }
}
