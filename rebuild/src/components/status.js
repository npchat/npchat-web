import { LitElement, html, css } from "lit"
import {classMap} from "lit/directives/class-map.js"

export class Status extends LitElement {

  static get properties() {
    return {
      isWebSocketConnected: {type: Boolean}
    }
  }

  static get styles() {
    return css`
      div {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--color-red);
        transition: background-color 300ms;
      }

      .connected {
        background-color: var(--color-green);
      }
    `
  }

  render() {
    return html`
      <div class=${classMap({connected: this.isWebSocketConnected})}></div>
    `
  }
}
