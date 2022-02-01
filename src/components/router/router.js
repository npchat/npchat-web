import { LitElement, html } from "lit";

export class Router extends LitElement {
  static get properties() {
    return {
      active: {},
      default: {}
    }
  }

  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector("slot");
    return slot?.assignedElements({flatten: true})
  }

  render() {
    return html`<slot></slot>`
  }

  connectedCallback() {
    super.connectedCallback()

    window.onpopstate = event => {
      event.preventDefault()
      this.active = event.state?.route || this.default
    }
  }

  updated() {
    console.log(this._slottedChildren)
    this._slottedChildren?.forEach(child => {
      if (child.getAttribute("route") === this.active) {
        child.removeAttribute("hidden")
      } else {
        child.setAttribute("hidden", "")
      }
    })
    if (!this.active) {
      let { pathname } = location
      if (this.isValidRoute(pathname)) {
        this.active = pathname
        return
      }
      //this.active = this.default
    }
  }

  isValidRoute(route) {
    return !!this._slottedChildren.find(child => {
      return child.getAttribute("route") === route
    })
  }
}