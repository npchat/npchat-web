/* eslint-disable no-undef */

self.addEventListener("push", event => {
    const message = event.data.text()
    self.registration.showNotification(message, {
      tag: "got-message",
      renotify: true,
      icon: "assets/npchat-logo.png"
  });
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(clientList => {
    for (let i = 0; i < clientList.length; i += 1) {
      const client = clientList[i]
      if (client.url === '/' && 'focus' in client) {
        return client.focus()
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/')
    }
  }))
})