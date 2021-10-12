import { Client } from "./component/client"
import { Menu } from "./component/menu";

window.addEventListener("DOMContentLoaded", () => {
  customElements.define("openchat-client", Client);
  customElements.define("openchat-menu", Menu);
})

