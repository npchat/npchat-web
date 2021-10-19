import { html, css } from "lit";
import { Base } from "./base";

export class Menu extends Base {
	
  static properties = {
    content: {},
		button: {},
		isOpen: {}
  }

	constructor() {
		super()
		this.isOpen = false
	}

	toggle() {
		this.isOpen = !this.isOpen
	}

	render() {
		return html`
			${this.button
				? html`<button class="menu-button" @click=${this.toggle}>${this.button}</button>`
				: undefined}
			<div class="menu-content" ?hidden=${!this.isOpen}>
				${this.content}
			</div>
		`;
	}
}