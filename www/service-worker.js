self.addEventListener("push", event => {
    const message = event.data.text()
    self.registration.showNotification(message, {
      tag: "got-message",
      renotify: true,
      icon: "assets/npchat-logo-400.png"
  });
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  // Focus window if already open
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