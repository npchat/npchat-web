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
    const canAccess = !match?.canAccess || match.canAccess && match.canAccess()
    if (match && canAccess) {
      this._active = route
    } else {
      this._active = this.default
      console.log("invalid route", {route, match, canAccess})
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

  /*
    TODO:
    1. find best match (longest matching path)
    2. for each slot:
        if is best match, remove attr hidden
        else, set it
  */
  updated() {
    if (!this.active) this.active = this.default
    const bestMatch = this._slottedChildren
      .filter(child => {
        const route = child.getAttribute("route")
        return this.matches(this.active, route)
      })
      .sort((a, b) => {
        const aRouteLength = a.getAttribute("route").length
        const bRouteLength = b.getAttribute("route").length
        console.log(aRouteLength, bRouteLength)
        return bRouteLength - aRouteLength
      })[0]

    this._slottedChildren?.forEach(child => {
      if (child === bestMatch) {
        child.removeAttribute("hidden")
      } else {
        child.setAttribute("hidden", "")
      }
    })
  }

  getMatch(pathname) {
    if (!pathname) return
    return this._slottedChildren?.find(child => {
      const route = child.getAttribute("route")
      return this.matches(pathname, route)
    })
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