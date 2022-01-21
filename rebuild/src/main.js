import { App } from "./components/app.js"
import { Welcome } from "./components/welcome.js"
import { Modal } from "./components/modal.js"
import { Preferences } from "./components/preferences.js"

customElements.define("npchat-app", App)
customElements.define("npchat-modal", Modal)
customElements.define("npchat-welcome", Welcome)
customElements.define("npchat-preferences", Preferences)
