import {Client} from "./components/client"


window.addEventListener("DOMContentLoaded", async () => {
  customElements.define('openchat-client', Client);
})

