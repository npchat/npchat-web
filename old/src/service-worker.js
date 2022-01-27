self.addEventListener("push", event => {
    // take publicKeyHash from event data & lookup contact display name
    self.registration.showNotification("Received message", {
      tag: "got-message"
  });
})

self.addEventListener("notificationclick", event => {
  event.notification.close()
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(clientList => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i]
      if (client.url == '/' && 'focus' in client) {
        return client.focus()
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/')
    }
  }))

    
  
})