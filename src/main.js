import { App } from "./components/app/app.js"
import { Router } from "./components/router/router.js"
import { RouteLink } from "./components/router/route-link.js"
import { Welcome } from "./components/welcome.js"
import { Preferences } from "./components/preferences/preferences.js"
import { Status } from "./components/status.js"
import { Shareable } from "./components/shareable.js"
import { Chats } from "./components/chats/chats.js"
import { Chat } from "./components/chat/chat.js"
import { Call } from "./components/call/call.js"
import { Toast } from "./components/toast.js"
import { Details } from "./components/details/details.js"

customElements.define("npchat-app", App)
customElements.define("npchat-router", Router)
customElements.define("npchat-route-link", RouteLink)
customElements.define("npchat-welcome", Welcome)
customElements.define("npchat-preferences", Preferences)
customElements.define("npchat-status", Status)
customElements.define("npchat-shareable", Shareable)
customElements.define("npchat-chats", Chats)
customElements.define("npchat-chat", Chat)
customElements.define("npchat-call", Call)
customElements.define("npchat-toast", Toast)
customElements.define("npchat-details", Details)
