import { openDBConn } from "./core/db.js"

// CACHE_VERSION is defined by build process
const CURRENT_CACHE = `cache-${CACHE_VERSION}`
const precacheResources = [
  "/",
  "/index.html",
  "/dist/main.js",
  "/dist/qrlib.js",
]

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CURRENT_CACHE).then(cache => cache.addAll(precacheResources))
  )
})

// clean up the previously registered service workers
self.addEventListener("activate", event => {
  // claim the client windows
  self.clients.claim()
  // clean up caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CURRENT_CACHE) {
            return caches.delete(key)
          }
          return Promise.resolve()
        })
      )
    )
  )
})

self.addEventListener("fetch", event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || fetch(event.request))
  )
})

self.addEventListener("push", async event => {
  const message = event.data.text()
  const parsed = JSON.parse(message)
  if (parsed.type === "message" && parsed.from) {
    const db = await openDBConn()
    const contact = await db.get("contacts", parsed.from)
    db.close()
    if (!contact) return
    self.registration.showNotification(
      `Message from ${contact?.displayName || "unknown"}`,
      {
        tag: "got-message",
        renotify: true,
        icon: "assets/npchat-logo-400.png",
        badge: "assets/icons/outline_message_black_24dp.png",
        data: {
          url: `/chat/${parsed.from}`,
        },
      }
    )
  }
})

self.addEventListener("notificationclick", event => {
  const route = event.notification.data.url
  event.notification.close()
  // Focus window if already open
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
      })
      .then(clientList => {
        for (let i = 0; i < clientList.length; i += 1) {
          const client = clientList[i]
          client.postMessage({ route })
          if ("focus" in client) {
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(route)
        }
      })
  )
})
