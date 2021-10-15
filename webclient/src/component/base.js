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
      font-size: .8rem;
      margin: 0 .2rem;
    }
    header .welcome {
      display: none
    }
    header .status {
      display: block;
      width: 10px;
      height:10px;
      border-radius: 10px;
      background-color: orange;
    }
    header .status.connected {
      background-color: green;
    }
    nav {
      display: flex;
    }
    nav > * {
      padding: .5rem;
      display: block;
    }
    a {
      text-decoration: none;
      color: #000;
      transition: background-color 0.2s
    }
    a:hover {
      background-color: #e5e5e5
    }
    .main {
			display: flex;
			flex-wrap: wrap;
      padding: .5rem;
		}
    .main > * {
      width: 100%;
    }
    button, input {
      padding: 0.5rem;
      font-size: 1rem;
    }
    .background {
      background-color: #f5f5f5;
    }
    .box {
      display: block;
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 2px;
    }
    .wrap {
      overflow-wrap: anywhere;
      word-break: break-all;
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
    .messages ul {
      display: flex;
      flex-direction: column;
    }
    .message {
      display: flex;
      margin: .2rem 0;
    }
    .message.sent {
      justify-content: right;
    }
    .message-body {
      padding: .5rem;
      border-radius: 5px;
      display: flex;
      flex-wrap: wrap;
    }
    .message-text {
      width: 100%;

    }
    .message.received .message-body {
      background-color: #e5e5e5;
    }
    .compose {
      display: flex;
    }
    #message-compose {
      flex-grow: 1;
    }
    .meta {
      color: #555;
      font-size: .8rem;
      user-select: none;
    }
    .small {
      font-size: .6rem;
    }
    .smaller {
      font-size: .5rem;
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
				width: calc(50% - 1rem)
			}
      header h1 {
        font-size: 1rem
      }
      header .welcome {
        display: block
      }
      .messages {
        padding: .5rem;
        border-left: 2px solid #e5e5e5;
      }
		}
  `;
}