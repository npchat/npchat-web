import { LitElement, html } from "lit";

export class Router extends LitElement {
  static get properties() {
    return {
      _active: {},
      default: {},
      basePath: {}
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
    if (!route.startsWith(this.basePath)) {
      return
    }
    const match = this.getMatch(route)
    if (match && (typeof match.canAccess !== "function" ||  match.canAccess())) {
      this._active = route
      if (this._active !== location.pathname) {
        history.pushState({
          route: this._active
        }, "", this._active)
      }
    }
  }

  render() {
    return html`<slot></slot>`
  }

  connectedCallback() {
    super.connectedCallback()

    window.addEventListener("popstate", event => {
      event.preventDefault()
      if (!event.state) return
      const {route} = event.state
      if (!this.basePath || route.startsWith(this.basePath)) {
        this.active = route
      }
    })

    window.addEventListener("route", () => {
      this.requestUpdate()
    })

    this.getUpdateComplete().then(() => {
      this.active = location.pathname
    })
  }

  async getUpdateComplete() {
    await super.getUpdateComplete()
    return Promise.all(this._slottedChildren.map(c => {
      return typeof c.getUpdateComplete === "function" && c.getUpdateComplete() || Promise.resolve()
    }))
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