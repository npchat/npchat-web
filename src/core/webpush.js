import { toBase64 } from "../util/base64.js"
import { registerServiceWorker } from "./worker.js"

async function askPermission() {
  const permission = await Notification.requestPermission()
  return permission === "granted"
}

export async function subscribeToPushNotifications(vapidKey) {
  if (!vapidKey) return
  if (!navigator.serviceWorker || !window.PushManager) {
    console.log("ServiceWorker or PushManager not supported")
    return
  }

  const gotPermission = await askPermission()
  if (!gotPermission) return

  let registration
  try {
    registration = await registerServiceWorker()
  } catch (e) {
    return
  }

  let currentSub = await registration.pushManager.getSubscription()
  if (currentSub) {
    // check if vapidKey changed
    const currentKey = new Uint8Array(currentSub.options.applicationServerKey)
    const currentKeyBase64 = toBase64(currentKey)
    if (currentKeyBase64 !== vapidKey) {
      await currentSub.unsubscribe()
      currentSub = undefined
    }
  }
  if (!currentSub) {
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })
      return JSON.stringify(sub.toJSON())
    } catch {
      console.log("failed to subscribe for web push")
    }
  }
}

export function addNotificationClickEventListener() {
  navigator.serviceWorker.addEventListener("message", event => {
    console.log("message!", event.data.route)
    const {route} = event.data
    window.dispatchEvent(new CustomEvent("route", {
      detail: route
    }))
  })
}