import { LitElement, css } from "lit";

export class Base extends LitElement {

	static styles = css`,,,,
    header, .main {
      width: 100%;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 .5rem;
    }
    header h1 {
      font-size: 1.4rem;
      margin: 0;
    }
    header .welcome {
      display: none
    }
    nav {
      display: flex;
    }
    nav > * {
      padding: 1rem;
      display: block;
    }
    nav > *:hover {
      background-color: #e5e5e5
    }
    a {
      text-decoration: none;
      color: #000;
    }
    .main {
			display: flex;
			flex-wrap: wrap;
      padding: .5rem;
		}
    button, input {
      padding: 0.25rem;
      font-size: 1rem;
    }
    input[type=text] {
      width: 300px;
    }
    .box {
      background-color: #f5f5f5;
      display: block;
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 2px;
    }
    .wrap {
      overflow-wrap: anywhere;
      white-space:pre;
      word-wrap:break-word;
    }
    .no-list{
      list-style: none;
      padding: 0
    }
    .contact {
      padding: 0.5rem;
    }
    .contact:hover, .contact.selected {
      background-color: #e5e5e5;
    }
    .message {
      padding: 0.5rem;
    }
    .message.background {
      background-color: #e5e5e5
    }
    .message.sent {
      
    }
    .meta {
      color: #555;
      font-size: .8rem;
      user-select: none;
    }
    .select-all {
      user-select: all;
    }
    .monospace {
      font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      font-size: .8rem
    }
    img {
      max-width: 100%
    }
    .error {
      color: #cc0000
    }
    .warn {
      color: #ff6700
    }
		@media(min-width: 750px) {
			.main > * {
				width: 49%
			}
      header h1 {
        font-size: 1.8rem
      }
      header .welcome {
        display: block
      }
		}
  `;
}