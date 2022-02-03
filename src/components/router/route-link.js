import { LitElement, html, css } from "lit"
import { goToRoute } from "./router"

export class RouteLink extends LitElement {
  static get styles() {
    return css`
      a {
        text-decoration: none;
        color: inherit;
      }
    `
  }

  static get properties() {
    return {
      route: {},
    }
  }

  constructor() {
    super()
    this.route = ""
  }

  render() {
    return html`
      <a href="${this.route}" @click="${this.handleClick}">
        <slot></slot>
      </a>
    `
  }

  handleClick(event) {
    event.preventDefault()
    goToRoute(this.route)
  }
}
