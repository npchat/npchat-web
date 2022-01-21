import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { getRoboHashURL } from "../util/avatar.js"

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
		<npchat-modal ?canClose=${false}>
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
    // set default origin
    detail.originURL = "https://axl.npchat.org"
    // generate keys
    
    // get fallback avatar from RoboHash
    if (detail.avatarURL === "") {
      detail.avatarURL = getRoboHashURL("mongo")
    }
    this.dispatchEvent(new CustomEvent("formSubmit", { detail }))
  }
}
