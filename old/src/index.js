import { App } from "./component/app"
import { Menu } from "./component/menu";

window.addEventListener("DOMContentLoaded", () => {
  customElements.define("npchat-app", App);
  customElements.define("npchat-menu", Menu);
})