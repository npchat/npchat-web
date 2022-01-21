import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"

export class Preferences extends LitElement {

  static get properties() {
    return {
      preferences: {type: Object}
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
          <span>Display name</span>
          <input type="text" name="displayName" placeholder="Anonymous" .value=${this.preferences.displayName} />
        </label>
        <label>
          <span>Avatar URL</span>
          <input type="text" name="avatarURL" placeholder="" .value=${this.preferences.avatarURL} />
          <p ?hidden=${!(typeof this.preferences.avatarURL === "string" && this.preferences.avatarURL.match("robohash"))}
              class="color-light">
            Robots lovingly delivered by Robohash.org
          </p>
        </label>
        <label>
          <span>Origin URL</span>
          <input list="origins" name="originURL" placeholder="https://axl.npchat.org" .value=${this.preferences.originURL} />
          <datalist id="origins">
            <option value="https://axl.npchat.org">
            <option value="https://frosty-meadow-296.fly.dev">
            <option value="https://wispy-feather-9047.fly.dev">
          </datalist>
          <p>Optionally point to your own self-hosted instance.
              Check the <a href="https://npchat.org/docs" target="_blank">docs</a> for guidance.</p>
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
