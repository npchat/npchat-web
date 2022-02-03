import { LitElement, html, css } from "lit"
import { classMap } from "lit/directives/class-map.js"

export class Status extends LitElement {
  static get properties() {
    return {
      isSocketConnected: { type: Boolean },
    }
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .light {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--color-red);
        transition: background-color 300ms;
      }

      div.connected {
        background-color: var(--color-green);
      }

      span {
        margin-left: 5px;
        user-select: none;
        opacity: 1;
        transition: opacity 200ms;
      }

      span.connected {
        opacity: 0;
      }

      @media (max-width: 300px) {
        span {
          display: none;
        }
      }
    `
  }

  render() {
    return html`
      <div class="container">
        <div
          class="light ${classMap({ connected: this.isSocketConnected })}"
        ></div>
        <span class=${classMap({ connected: this.isSocketConnected })}>
          Not connected
        </span>
      </div>
    `
  }
}
