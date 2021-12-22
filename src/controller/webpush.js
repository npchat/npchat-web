import { bytesToBase64 } from "../util/base64";

export class WebPushController {
	host;

	constructor(host) {
		this.host = host
		host.addController(this)
	}

	async subscribeToPushNotifications(vapidKey) {
		if (!navigator.serviceWorker || !window.PushManager) {
			console.log("ServiceWorker or PushManager not supported")
			return
		}
		const registration = await this.registerServiceWorker()
		if (!registration) return
		const gotPermission = await this.askPermission()
		if (!gotPermission) return
		let currentSub = await registration.pushManager.getSubscription()
		if (currentSub) {
			// check if vapidKey changed
			const currentKey = new Uint8Array(currentSub.options.applicationServerKey)
			const currentKeyBase64 = bytesToBase64(currentKey)
			if (currentKeyBase64 !== vapidKey) {
				await currentSub.unsubscribe()
				currentSub = undefined
			}
		}
		if (!currentSub) {
			try {
				const sub = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: vapidKey
				})
				this.host.websocket.socket.send(JSON.stringify({subscription: sub.toJSON()}))
				console.log("new subscription", sub)
			} catch {
				console.log("failed to subscribe for web push")
				return
			}
		}
	}

	async registerServiceWorker() {
		try {
			return await navigator.serviceWorker.register("/dist/service-worker.js")
		} catch (e) {
			console.log("SW registration failed", e)
		}
	}

	async askPermission() {
		const permission = await Notification.requestPermission()
		return permission === "granted"
	}
}