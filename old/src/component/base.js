import { LitElement, css } from "lit";

export class Base extends LitElement {

  static c = {
    primary: css`#1098F7`,
    secondary: css`#2FBF71`,
    highlight: css`#FF3E41`,
    bgDark: css`#010409`,
    bgLight: css`#161D27`,
    bgLighter: css`#253141`,
    text: css`#FBF5F3`,
    textDark: css`#D6D6D6`
  }

	static styles = css`,,,,
    header, .main {
      width: 100%;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 .5rem;
      background-color: ${this.c.bgLight}
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
      width: 12px;
      height:12px;
      border-radius: 10px;
      background-color: ${this.c.highlight};
    }
    header .status.connected {
      background-color: ${this.c.secondary};
    }
    nav {
      display: flex;
    }
    nav > a {
      padding: .5rem .8rem;
      display: flex;
      align-items: center;
    }
    nav .icon {
      font-size: 1.5rem;
    }
    nav .label {
      display: none;
      margin-left: .5rem
    }
    nav > .selected {
      background-color: ${this.c.bgLighter}
    }
    p {
      font-size: .95rem;
    }
    a {
      text-decoration: none;
      color: ${this.c.textDark};
      transition: color 0.2s;
    }
    a:hover {
      color: ${this.c.text};
    }
    a.link {
      background-color: ${this.c.bgLight};
      display: inline-block;
      padding: 0.25rem;
      border-radius: 2px;
    }
    a.link:hover {
      color: ${this.c.primary}
    }
    .main {
			display: flex;
			flex-wrap: wrap;
		}
    .main > * {
      width: 100%;
    }
    .menu-content {
			padding: 0.5rem;
		}
    button, input {
      font-size: 1rem;
    }
    button {
      padding: 0.3rem 0.5rem;
      background-color: ${this.c.bgLight};
      color: ${this.c.textDark};
      border: 1px solid ${this.c.textDark};
      border-radius: 5px;
    }
    button:hover {
      border-color: ${this.c.text};
      background-color: ${this.c.bgLighter};
      color: ${this.c.text}
    }
    input {
      padding: 0.8rem;
      background-color: ${this.c.bgDark};
      color: ${this.c.text};
      outline: none;
      border: 1px solid ${this.c.bgLighter};
      border-radius: 5px;
      transition: all 0.2s
    }
    input:focus {
      background-color: ${this.c.bgLight};
      border-color: ${this.c.primary};
    }
    input.warn {
      border-color: ${this.c.highlight}
    }
    input.success {
      border-color: ${this.c.secondary}
    }
    .box {
      display: block;
      padding: 0.5rem;
      margin: 1rem 0;
      border-radius: 2px;
      background-color: ${this.c.bgLight};
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
      display: flex;
      cursor: pointer
    }
    .contact:hover {
      background-color: ${this.c.bgLight};
    }
    .contact.selected {
      background-color: ${this.c.bgLighter}
    }
    .contact .label {
      flex-grow: 1
    }
    .messages ul {
      display: flex;
      flex-direction: column;
      padding-bottom: 25px;
    }
    .message {
      display: flex;
      margin: .2rem 0;
    }
    .message.sent {
      justify-content: right;
    }
    .message.sent .message-body {
      justify-content: flex-end;
    }
    .message-body {
      padding: .5rem;
      border-radius: 5px;
      display: flex;
      flex-wrap: wrap;
      max-width: 80%;
    }
    .message-text {
      width: 100%;
    }
    .message.received .message-body {
      background-color: ${this.c.bgLight};
    }
    .compose {
      position: fixed;
      bottom: 0;
      left: 0.25rem;
      width: calc(100% - 1rem);
    }
    #message-input {
      width: calc(100% - 1.25rem);
    }
    .meta {
      color: ${this.c.textDark};
      font-size: .7rem;
      user-select: none;
    }
    .select-all {
      user-select: all;
    }
    .monospace {
      font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
      font-size: .7rem
    }
    img {
      max-width: 100%
    }
    .warn {
      color: ${this.c.highlight}
    }
		@media(min-width: 750px) {
			.main > * {
				width: calc(50% - .6rem)
			}
      header h1 {
        font-size: 1rem
      }
      header .welcome {
        display: block
      }
      nav .label {
        display: inline-block;
      }
      .messages {
        padding: .5rem;
        border-left: 2px solid ${this.c.bgLight};
      }
      .message-body {
        max-width: 60%;
      }
      .compose {
        width: calc(50% - 1rem);
        left: 50%
      }
		}
  `;
}