import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"

export class Status extends LitElement {

  static get properties() {
    return {
      isWebSocketConnected: {type: Boolean}
    }
  }

  static get styles() {
    return [
      css`
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        `,
        formStyles,
        generalStyles,
    ]
  }

  render() {
    return html`
		<npchat-modal ?canClose=${true}>
      <h1>Preferences</h1>
      <form @submit=${this.handleSubmit}>
        <label>
          <span>Your display name</span>
          <input type="text" name="displayName" placeholder="Anonymous" .value=${this.preferences.displayName} />
        </label>
        <p class="color-light">Optional</p>
        <label>
          <span>Your avatar URL</span>
          <input type="text" name="avatarURL" placeholder="" .value=${this.preferences.avatarURL} />
          <p ?hidden=${!(typeof this.preferences.avatarURL === "string" && this.preferences.avatarURL.match("robohash"))}
              class="color-light">
            Robots lovingly delivered by Robohash.org
          </p>
        </label>
        <label>
          <span>Your origin URL</span>
          <input list="origins" name="originURL" placeholder="https://axl.npchat.org" .value=${this.preferences.originURL} />
          <datalist id="origins">
            <option value="https://axl.npchat.org">
            <option value="https://frosty-meadow-296.fly.dev">
            <option value="https://wispy-feather-9047.fly.dev">
          </datalist>
        </label>
        <button type="submit">Submit</button>
      </form>
		</npchat-modal>
    `
  }

  handleSubmit(e) {
    e.preventDefault()
    const detail = Object.fromEntries(new FormData(e.target))
    if (detail.displayName === "") {
      detail.displayName = "Anonymous"
    }
    this.dispatchEvent(new CustomEvent("formSubmit", { detail }))
  }
}
