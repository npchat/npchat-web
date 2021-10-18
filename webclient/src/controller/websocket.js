import { signChallenge } from "../../../util/auth";

export class WebSocketController {
	host;

	static properties = {
		isConnected: {}
	}

	constructor(host) {
		this.host = host
		host.addController(this)
		this.isConnected = false
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.isConnected = false
			const pref = this.host.pref
			this.socket = this.getWebSocket(pref.domain, pref.keys.auth.publicHash)
			this.socket.addEventListener("open", () => this.handleOpen())
			this.socket.addEventListener("close", () => this.handleClose(reject))
			this.socket.addEventListener("message", async event => this.handleMessage(event, resolve))
		})
	}

	handleOpen() {
		this.socket.send(JSON.stringify({ get: "challenge" }))
	}

	async handleMessage(event, resolve) {
		const pref = this.host.pref
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
			const challengeResponse = {
				jwk: pref.keys.auth.jwk.public,
				challenge: data.challenge,
				solution: await signChallenge(pref.keys.auth.keyPair.privateKey, data.challenge.txt)
			}
			this.socket.send(JSON.stringify(challengeResponse))
			return
		}
		if (data.vapidAppPublicKey) {
			await this.host.webpush.subscribeToPushNotifications(data.vapidAppPublicKey)
		}
		this.isConnected = true
		resolve()
		await this.host.message.handleReceivedMessage(data, true)
		this.host.requestUpdate()
	}

	handleClose(reject) {
		console.log("Connection closed")
		this.isConnected = false
		this.socket = undefined
		reject()
	}

	getWebSocket(domain, publicKeyHash) {
		return new WebSocket(`wss://${domain}/${publicKeyHash}`)
	}
}