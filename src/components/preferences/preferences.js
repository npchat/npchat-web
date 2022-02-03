import { LitElement, html } from "lit"
import { pack } from "msgpackr"
import { openDBConn } from "../../core/db.js"
import { getUserExportData } from "../../core/export.js"
import { avatarSize, putMedia } from "../../core/media.js"
import { formStyles } from "../../styles/form.js"
import { avatarFallbackURL, generalStyles } from "../../styles/general.js"
import { toBase64 } from "../../util/base64.js"
import { resizeImageFile } from "../../util/image.js"
import { generateQR } from "../../util/qrcode.js"
import { goToRoute } from "../router/router.js"
import { preferencesStyles } from "./styles.js"

export class Preferences extends LitElement {
  static get properties() {
    return {
      preferences: { type: Object },
    }
  }

  static get styles() {
    return [formStyles, generalStyles, preferencesStyles]
  }

  get avatarFileInput() {
    return this.renderRoot.getElementById("avatar-file")
  }

  get avatarPreview() {
    return this.renderRoot.getElementById("avatar-preview")
  }

  get router() {
    return this.renderRoot.querySelector("npc-router")
  }

  willUpdate() {
    this.buildExportData().then(() => this.update())
  }

  mainFormTemplate() {
    return html`
      <form route="/preferences" @submit=${this.handleSubmit} class="flex">
        <label>
          <span>Display name</span>
          <input
            type="text"
            name="displayName"
            placeholder="Anonymous"
            .value=${this.preferences.displayName}
          />
        </label>
        <label>
          <span>Avatar</span>
          <div class="row">
            <img
              alt="avatar"
              id="avatar-preview"
              class="avatar"
              src=${this.preferences.avatarURL || avatarFallbackURL}
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
          <span>Origin URL</span>
          <input
            list="origins"
            name="originURL"
            placeholder="https://axl.npchat.org"
            .value=${this.preferences.originURL}
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
        <button type="submit" class="button">Submit</button>

        <div class="row">
          <npc-route-link route="/preferences/export">
            <div class="button small">Export</div>
          </npc-route-link>
          <p class="exportDesc">Export data for another device</p>
        </div>

        <div class="row">
          <button type="button" class="button small error" @click=${this.clearData}>Clear data</button>
          <p class="exportDesc">Sign out permenantly by deleting the keys, contacts & messages from the browser's storage</p>
        </div>
      </form>
    `
  }

  exportTemplate() {
    return html`
      <div route="/preferences/export">
        <div class="flex row">
          <npc-route-link route="/preferences" class="button icon back">
            <img alt="back" src="assets/icons/arrow_back.svg" />
          </npc-route-link>
          <h2 class="exportHeader">Export</h2>
        </div>
        <div class="flex">
          <p class="monospace">${this.exportData}</p>
          <button @click=${this.handleExportCopy} class="button">Copy</button>
          <img alt="export QR" src=${this.exportQR} />
        </div>
      </div>
    `
  }

  render() {
    return html`
      <div class="main">
        <h1>Preferences</h1>
        <npc-router default="/preferences" basePath="/preferences">
          ${this.mainFormTemplate()} ${this.exportTemplate()}
        </npc-router>
      </div>
    `
  }

  async clearData() {
    if (!window.confirm("Are you sure you want to log out permenantly? Save your export data somewhere if you wish to gain access again.")) {
      return
    }
    localStorage.clear()
    const db = await openDBConn()
    await db.clear("contacts")
    await db.clear("messages")
    goToRoute("/")
    location.reload()
  }

  async buildExportData() {
    const data = getUserExportData()
    const packed = toBase64(pack(data))
    this.exportData = packed
    this.exportQR = await generateQR(
      `${window.location.origin}#import:${packed}`,
      {
        errorCorrectionLevel: "L",
      }
    )
  }

  async handleSubmit(event) {
    event.preventDefault()
    const detail = Object.fromEntries(new FormData(event.target))
    if (detail.displayName === "") {
      detail.displayName = "Anonymous"
    }
    if (detail.avatarFile.size > 0) {
      const resizedBlob = await resizeImageFile(
        detail.avatarFile,
        avatarSize,
        avatarSize
      )
      detail.avatarURL = await putMedia(resizedBlob, "image/jpeg")
    } else {
      detail.avatarURL = this.preferences.avatarURL
    }
    detail.avatarFile = undefined
    this.avatarFileInput.value = ""
    this.dispatchEvent(new CustomEvent("formSubmit", { detail }))
  }

  async handleExportCopy(event) {
    const button = event.target
    button.classList.add("success")
    setTimeout(() => {
      button.classList.remove("success")
    }, 500)
    await navigator.clipboard.writeText(this.exportData)
  }

  async handleAvatarChange(event) {
    const file = event.target.files[0]
    const resizedBlob = await resizeImageFile(file, 100, 100)
    this.avatarPreview.src = URL.createObjectURL(resizedBlob)
  }

  canAccess() {
    return !!localStorage.originURL
  }
}
