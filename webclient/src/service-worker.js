self.addEventListener("message", event => {
  console.log("got message", event)
})

self.addEventListener("push", event => {
  event.waitUntil(() => {
    self.registration.showNotification("Wooohooo! Very great.", {
      body: "yeyeyeyeee"
    })
  });
})