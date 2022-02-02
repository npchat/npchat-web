import { LitElement, html } from "lit";

export class Router extends LitElement {
  static get properties() {
    return {
      _active: {},
      default: {}
    }
  }

  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector("slot");
    return slot?.assignedElements({flatten: true})
  }

  get active() {
    return this._active
  }

  set active(route) {
    const match = this.getMatch(route)
    if (match && typeof match.canAccess !== "function" ||  match.canAccess()) {
      this._active = route
      if (this._active !== location.pathname) {
        history.pushState({
          route: this._active,
          routerId: this.id
        }, "", this._active)
      }
    } else {
      this._active = this.default
      console.log("invalid route", {route, match})
    }
  }

  render() {
    return html`<slot></slot>`
  }

  connectedCallback() {
    super.connectedCallback()

    if (!this.id) console.log("router must have an id", this)

    window.addEventListener("popstate", event => {
      event.preventDefault()
      if (!event.state) return
      const {route, routerId} = event.state
      if (routerId === this.id) {
        this.active = route
      }
    })

    window.addEventListener("routerNavigate", () => {
      this.requestUpdate()
    })
  }

  async getUpdateComplete() {
    await super.getUpdateComplete()
    return Promise.all(this._slottedChildren.map(c => c.getUpdateComplete()))
  }

  updated() {
    const match = this.getMatch(this.active || this.default)
    this._slottedChildren?.forEach(child => {
      if (child === match) {
        child.removeAttribute("hidden")
      } else {
        child.setAttribute("hidden", "")
      }
    })
  }

  getMatch(pathname) {
    if (!pathname) return
    if (!this._slottedChildren) return

    return this._slottedChildren
      .filter(child => {
        const route = child.getAttribute("route")
        return this.matches(pathname, route)
      })
      .sort((a, b) => {
        const aRouteLength = a.getAttribute("route").length
        const bRouteLength = b.getAttribute("route").length
        console.log(aRouteLength, bRouteLength)
        return bRouteLength - aRouteLength
      })[0]
  }

  matches(pathname, route) {
    if (route === "/") {
      // root path always starts with "/",
      // so must match exactly
      return route === pathname
    } else {
      return pathname.startsWith(route)
    }
  }
}