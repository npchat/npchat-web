import { sign } from "../util/auth";
import { base64ToBytes, bytesToBase64 } from "../util/base64";

export class WebSocketController {
	host;

	static properties = {
		isConnected: {}
	}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.isConnected = false
		window.addEventListener("beforeunload", () => {
			this.socket.close()
		})
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.isConnected = false
			this.host.requestUpdate()
			this.socket = this.getWebSocket(this.host.pref.origin, this.host.pref.keys.auth.publicKeyHash)
			this.socket.addEventListener("open", () => this.handleOpen())
			this.socket.addEventListener("close", () => this.handleClose(reject))
			this.socket.addEventListener("message", async event => this.handleMessage(event, resolve))
		})
	}

	handleOpen() {
		this.socket.send(JSON.stringify({ get: "challenge" }))
	}

	async handleMessage(event, resolve) {
		let msg
		try {
			msg = JSON.parse(event.data)
		} catch (e) {
			console.log("Failed to parse JSON", e)
			return
		}
		if (msg.error) {
			this.isConnected = false
			console.error("WS error:", msg.error)
			this.host.requestUpdate()
			return
		}
		if (msg.challenge) {
			const solution = await sign(this.host.pref.keys.auth.keyPair.privateKey, base64ToBytes(msg.challenge.txt))
			const challengeResponse = {
				publicKey: this.host.pref.keys.auth.base64.publicKey,
				challenge: msg.challenge,
				solution: bytesToBase64(new Uint8Array(solution))
			}
			this.socket.send(JSON.stringify(challengeResponse))
			return
		}
		if (msg.message && !msg.error) { // handshake was successful
			if (msg.vapidKey) {
				await this.host.webpush.subscribeToPushNotifications(msg.vapidKey)
			}
			if (msg.data) {
				this.parseData(msg.data)
			}
			this.isConnected = true
			this.host.requestUpdate()
			resolve()
			return
		}
		await this.host.message.handleReceivedMessage(msg, true)
	}

	handleClose(reject) {
		console.log("Connection closed")
		this.isConnected = false
		this.socket = undefined
		reject()
		this.host.requestUpdate()
	}

	getWebSocket(origin, publicKeyHash) {
		origin = origin.replace("http", "ws") // either ws or wss
		return new WebSocket(`${origin}/${publicKeyHash}`)
	}

	setData(data) {
		this.socket.send(JSON.stringify({
			set: "data",
			data: data
		}))
	}

	parseData(data) {
		let parsed
		try {
			parsed = JSON.parse(data)
		} catch (e) {
			console.log("Failed to parse JSON", e)
		}
		if (parsed && parsed.contacts) {
			console.log("got contacts", parsed.contacts)
			parsed.contacts.forEach(c => {
				this.host.contact.addContact(c)
			})
		}
	}
}