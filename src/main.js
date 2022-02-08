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
import { Toolbar } from "./components/toolbar.js"

customElements.define("npc-app", App)
customElements.define("npc-router", Router)
customElements.define("npc-route-link", RouteLink)
customElements.define("npc-welcome", Welcome)
customElements.define("npc-preferences", Preferences)
customElements.define("npc-status", Status)
customElements.define("npc-shareable", Shareable)
customElements.define("npc-chats", Chats)
customElements.define("npc-chat", Chat)
customElements.define("npc-call", Call)
customElements.define("npc-toast", Toast)
customElements.define("npc-details", Details)
customElements.define("npc-toolbar", Toolbar)