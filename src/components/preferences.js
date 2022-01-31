import { LitElement, html, css } from "lit"
import { pack } from "msgpackr"
import { getUserExportData } from "../core/export.js"
import { putMedia } from "../core/media.js"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { toBase64 } from "../util/base64.js"
import { resizeImageFile } from "../util/image.js"
import { generateQR } from "../util/qrcode.js"

export class Preferences extends LitElement {
  static get properties() {
    return {
      preferences: { type: Object },
      showExport: { type: Boolean }
    }
  }

  static get styles() {
    return [
      formStyles,
      generalStyles,
      css`
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .exportData {
          display: flex;
          align-items: center;
        }

        img {
          max-width: 100%;
        }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .row {
          display: flex;
          align-items: center;
        }

        #avatar-file {
          margin-left: 5px;
          max-width: calc(100vw - 100px);
        }
      `
    ]
  }

  get avatarFileInput() {
    return this.renderRoot.getElementById("avatar-file")
  }

  get avatarPreview() {
    return this.renderRoot.getElementById("avatar-preview")
  }
  
  constructor() {
    super()
    this.showExport = false
  }

  willUpdate() {
    this.buildExportData()
      .then(() => this.update())
  }

  mainFormTemplate() {
    return html`
    <form @submit=${this.handleSubmit}>
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
          <img id="avatar-preview" class="avatar" src=${this.preferences.avatarURL}/>
          <input type="file" id="avatar-file" name="avatarFile" accept="image/png, image/jpeg" @change=${this.handleAvatarChange}>
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
      <button type="submit" class="normal">Submit</button>
      <p>Export data for another device</p>
      <button type="button" class="normal secondary" @click=${() => this.showExport = true}>Export</button>
    </form>
    `
  }

  exportTemplate() {
    return html`
    <div ?hidden=${!this.showExport}>
      <button class="icon" @click=${() => this.showExport = false}>
        <img alt="back" src="assets/icons/arrow_back.svg" />
      </button>
      <div class="exportData">
        <p class="monospace">
          ${this.exportData}
        </p>
        <button @click=${this.handleExportCopy} class="normal copy">Copy</button>
      </div>
      <img alt="export QR" src=${this.exportQR} />
    </div>
    `
  }

  render() {
    return html`
      <npchat-modal ?canClose=${true}>
        <h1>Preferences</h1>
        ${this.showExport ? undefined : this.mainFormTemplate()}
        ${this.exportTemplate()}
      </npchat-modal>
    `
  }

  async buildExportData() {
    const data = await getUserExportData()
    const packed = toBase64(pack(data))
    this.exportData = packed
    this.exportQR = await generateQR(`${window.location.origin}#import:${packed}`, {
      errorCorrectionLevel: "L"
    })
  }

  async handleSubmit(event) {
    event.preventDefault()
    const detail = Object.fromEntries(new FormData(event.target))
    if (detail.displayName === "") {
      detail.displayName = "Anonymous"
    }
    if (detail.avatarFile.size > 0) {
      const resizedBlob = await resizeImageFile(detail.avatarFile, 100, 100)
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
    const resizedBlob = await resizeImageFile(file, 50, 50)
    this.avatarPreview.src = URL.createObjectURL(resizedBlob)
  }
}
