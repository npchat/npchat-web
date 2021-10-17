export class WebPushController {
	host;

	constructor(host) {
		this.host = host
		this.appPublicKey = 
		host.addController(this)
	}

	async init() {
		return this.subscribeToPushNotifications()
	}

	async subscribeToPushNotifications() {
		if (!navigator.serviceWorker || !window.PushManager) {
			console.log("ServiceWorker or PushManager not supported")
			return
		}
		const registration = await this.registerServiceWorker()
		if (!registration) return
		const gotPermission = await this.askPermission()
		if (!gotPermission) return
		let currentSub = await registration.pushManager.getSubscription()
		if (!currentSub) {
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: await this.getAppPublicKey()
			})
			currentSub = sub
			this.host.websocket.socket.send(JSON.stringify({subscription: currentSub.toJSON()}))
			console.log("new subscription", currentSub)
		} else {
			console.log("already subscribed", currentSub)
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
		console.log("permission", permission)
		return permission === "granted"
	}

	async getAppPublicKey() {
		return new Promise((resolve, reject) => {
			this.host.websocket.socket.addEventListener("message", e => this.handleGotAppPublicKey(e, resolve, reject), {once: true})
			this.host.websocket.socket.send(JSON.stringify({get: "vapidAppPublicKey"}))
		})
	}

	handleGotAppPublicKey(event, resolve, reject) {
		let data
		try {
			data = JSON.parse(event.data)
		} catch (e) {
			console.log("Failed to parse message data, expected appPublicKey.")
			return
		}
		if (data.vapidAppPublicKey) {
			resolve(data.vapidAppPublicKey)
		} else {
			reject("No vapidAppPublicKey in message data")
		}
	}
}