import { html, css, LitElement } from "lit";
import { generalStyles } from "../styles/general.js";

export class Modal extends LitElement {
	
  static get properties() {
		return {
			canClose: {type: Boolean}
		}
  }

	static get styles() {
		return [
			css`
				.container {
					height: 100vh;
					width: 100vw;
					display: flex;
					align-items: center;
					justify-content: center;
					position: absolute;
					top: 0;
					left: 0;
					z-index: 1;
				}

				.modal {
					background-color: var(--color-offwhite);
					padding: 20px;
					border: 5px solid;
					max-width: 400px;
					filter: drop-shadow(0 16px 16px rgba(0,0,0,0.4));
				}

				a.close:not([hidden]) {
					position: absolute;
					top: 7px;
					right: 5px;
					display: flex;
					align-items: center;
					justify-content: center;
					text-decoration: none;
					font-size: 1.8rem;
					line-height: 1.8rem;
					font-weight: 600;
					color: var(--color-darkgrey);
					padding: 10px;
					width: 20px;
					height: 20px;
					border: 2px solid var(--color-primary);
					border-radius: 50%;
					transition: all 300ms;
				}

				a.close:hover {
					background-color: var(--color-lightgrey);
					border-color: var(--color-secondary);
				}
			`,
			generalStyles
		]
	}

	render() {
		return html`
			<div class="container">
				<a href="#"
						@click=${this.handleClose}
						?hidden=${!this.canClose}
						class="close">
					x
				</a>
				<div class="modal border-gradient">
					<slot></slot>
				</div>
			</div>
		`;
	}

	handleClose() {
		this.dispatchEvent(new CustomEvent("close", {
			bubbles: true, 
			composed: true
		}))
	}
}