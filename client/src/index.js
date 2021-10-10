import { Client } from "./components/client"

window.addEventListener("DOMContentLoaded", () => {
  customElements.define('openchat-client', Client);
})

