import { LitElement, html } from "lit";

export class RouteLink extends LitElement {
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
    this.navigate(this.route)
  }

  navigate(route) {
    this.dispatchEvent(new CustomEvent("routerNavigate", {
      detail: route,
      composed: true,
      bubbles: true
    }))
    if (location.pathname !== route) {
      history.pushState({route}, "", route)
    } 
  }
}