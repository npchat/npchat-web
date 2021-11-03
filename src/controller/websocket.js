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
		let data
		try {
			data = JSON.parse(event.data)
		} catch (e) {
			console.log("Failed to parse JSON", e)
			return
		}
		if (data.error) {
			this.isConnected = false
			console.log("WS error", data.error)
			this.host.requestUpdate()
			return
		}
		if (data.challenge) {
			const solution = await sign(this.host.pref.keys.auth.keyPair.privateKey, base64ToBytes(data.challenge.txt))
			const challengeResponse = {
				publicKey: this.host.pref.keys.auth.base64.publicKey,
				challenge: data.challenge,
				solution: bytesToBase64(new Uint8Array(solution))
			}
			this.socket.send(JSON.stringify(challengeResponse))
			return
		}
		if (data.message || data.vapidAppPublicKey) { // handshake was successful
			if (data.vapidAppPublicKey) {
				await this.host.webpush.subscribeToPushNotifications(data.vapidAppPublicKey)
			}
			this.isConnected = true
			this.host.requestUpdate()
			resolve()
			return
		}
		await this.host.message.handleReceivedMessage(data, true)
		this.host.requestUpdate()
	}

	handleClose(reject) {
		console.log("Connection closed")
		this.isConnected = false
		this.socket = undefined
		reject()
		this.host.requestUpdate()
	}

	getWebSocket(origin, publicKeyHash) {
		// go either to ws or wss
		origin = origin.replace("http", "ws")
		return new WebSocket(`${origin}/${publicKeyHash}`)
	}
}