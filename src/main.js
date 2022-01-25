import { App } from "./components/app.js"
import { Welcome } from "./components/welcome.js"
import { Modal } from "./components/modal.js"
import { Preferences } from "./components/preferences.js"
import { Status } from "./components/status.js"
import { Shareable } from "./components/shareable.js"
import { Contacts } from "./components/contacts.js"
import { Contact } from "./components/contact.js"
import { Toast } from "./components/toast.js"

customElements.define("npchat-app", App)
customElements.define("npchat-modal", Modal)
customElements.define("npchat-welcome", Welcome)
customElements.define("npchat-preferences", Preferences)
customElements.define("npchat-status", Status)
customElements.define("npchat-shareable", Shareable)
customElements.define("npchat-contacts", Contacts)
customElements.define("npchat-contact", Contact)
customElements.define("npchat-toast", Toast)
