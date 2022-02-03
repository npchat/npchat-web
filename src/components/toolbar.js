import { LitElement, html, css } from "lit"

export class Toolbar extends LitElement {

  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        position: sticky;
        top: 0;
        background-color: var(--color-offwhite);
        filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
      }

      .foo {
        width: calc(100vw - 10px);
        max-width: 400px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `
  }

  render() {
    return html`
    <div class="foo">
      <slot></slot>
    </div>
    `
  }
}
