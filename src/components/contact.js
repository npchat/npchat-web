import { LitElement, html, css } from "lit"
import { formStyles } from "../styles/form.js"

export class Contact extends LitElement {

  static get properties() {
    return {
      shareableData: {type: Object}
    }
  }

  static get styles() {
    return [
      formStyles,
      css`
        .container {
          margin: 5px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        input {
          margin-bottom: 5px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          transition: border-color 300ms;
        }

        .name {
          margin-left: 10px;
          font-size: 1.4rem;
          user-select: none;
        }
      `
    ]
  }

  constructor() {
    super()
    window.addEventListener("contactsChanged", () => {
      this.requestUpdate()
    })
  }


  filterContacts() {
    if (!this.contacts) return []
    const entries = Object.entries(this.contacts)
    if (!this.filter) {
      return entries
    }
    return entries
      .filter(entry => JSON.stringify(entry[1]).indexOf(this.filter) > -1)
  }

  render() {
    return html`
    <div class="container">
      <div class="list">
        <h1>messages here</h1>
      </div>
      <form class="compose" @submit=${this.handleSubmit}>
        <input type="text" placeholder="write a message" name="message"/>
      </form>
    </div>
    `
  }

  async handleSubmit(e) {
    e.preventDefault()
    const {message} = Object.fromEntries(new FormData(e.target))
    console.log(message)
    // use websocket to send message

    // display message

    // add to stored messages
  }
  
}
