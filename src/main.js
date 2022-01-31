import { App } from "./components/app.js"
import { Welcome } from "./components/welcome.js"
import { Modal } from "./components/modal.js"
import { Preferences } from "./components/preferences.js"
import { Status } from "./components/status.js"
import { Shareable } from "./components/shareable.js"
import { Contacts } from "./components/contacts.js"
import { Chat } from "./components/chat.js"
import { Call } from "./components/call.js"
import { Toast } from "./components/toast.js"
import { Details } from "./components/details.js"

customElements.define("npchat-app", App)
customElements.define("npchat-modal", Modal)
customElements.define("npchat-welcome", Welcome)
customElements.define("npchat-preferences", Preferences)
customElements.define("npchat-status", Status)
customElements.define("npchat-shareable", Shareable)
customElements.define("npchat-contacts", Contacts)
customElements.define("npchat-chat", Chat)
customElements.define("npchat-call", Call)
customElements.define("npchat-toast", Toast)
customElements.define("npchat-details", Details)
