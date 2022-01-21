import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"

export class Welcome extends LitElement {

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
		<npchat-modal @close=${this.handleDismiss}>
      <h1>Welcome to npchat</h1>
			<h2>Let's get you set up</h2>
      <form @submit=${this.handleSubmit}>
        <label>
          <span>Your display name</span>
          <input type="text" name="displayName" placeholder="Anonymous" />
        </label>
        <p class="color-light">Optional</p>
        <label>
          <span>Your avatar URL</span>
          <input type="text" name="avatarURL" placeholder="" />
        </label>
        <label>
          <span>Your origin URL</span>
          <input list="origins" name="origin" placeholder="https://axl.npchat.org" />
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
    this.dispatchEvent(new CustomEvent("welcomeSubmit", { detail }))
  }

	handleDismiss() {
		this.dispatchEvent(new CustomEvent("welcomeDismiss"))
	}
}
