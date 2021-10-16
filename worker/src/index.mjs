/**
	npchat protocol JS implementation
	a Cloudflare Worker using Durable Objects
	https://developers.cloudflare.com/workers/learning/using-durable-objects
*/

import { importAuthKey } from '../../util/key'
import { hasChallengeExpired, verify } from '../../util/auth'
import { base58 } from '../../util/base58'
import { messagesKey } from '../../util/message'
import { hash } from '../../util/hash'

/**
	@returns {Object} default response options
*/
const defaultResponseOpts = () => { return {
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-ALlow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Max-Age": 86400,
		"Vary": "Origin"
	},
	status: 200
	}
}

/**
	@param {Request} request
	@returns {String} authPubJwkHashBase58
*/
const getAuthPubKeyHashFromRequest = request => {
	const url = new URL(request.url)
	return url.pathname.split("/")[1]
}

export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  }
}

async function handleRequest(request, env) {
	if (request.method === "OPTIONS") {
		return new Response("Allowed methods: GET, POST, OPTIONS", defaultResponseOpts())
	}
	const opts = defaultResponseOpts()
	const publicHash = getAuthPubKeyHashFromRequest(request)
	if (!publicHash) {
		opts.status = 400
		return new Response(JSON.stringify({error: "Missing publicKeyHash"}), opts)
	}
  const id = env.CHANNEL.idFromName(publicHash)
  const obj = env.CHANNEL.get(id)
	if (request.method === "GET"){
		return await obj.fetch(request.url, {headers: request.headers})
	}
	if (request.method === "POST") {
		return await obj.fetch(request.url, {
			method: request.method,
			headers: request.headers,
			body: request.body
		})
	}
	opts.status = 405
	return new Response(JSON.stringify({error: "Method not allowed"}), defaultResponseOpts())
}

/**
	Channel Durable Object.
	Storage for one-way messaging.
	
	Current state holds:
	- challenge
	- messages

	Environment sets:
	- challengeTtl
*/
export class Channel {
	constructor(state, env) {
		this.state = state
		this.challengeTtl = new Number(env.CHALLENGE_TTL)
		this.challenge = {}
		this.authedSockets = []
	}

	async fetch(request) {
		const upgradeHeader = request.headers.get("Upgrade")
		if (upgradeHeader) {
			return await this.handleUpgrade(request, upgradeHeader)
		}
		if (request.method === "POST") {
			return this.handlePostMessage(request)
		}
		const opts = defaultResponseOpts()
		opts.status = 400
		return new Response(JSON.stringify({error: "Bad request"}), opts)
	}

	async handleUpgrade(request, upgradeHeader) {
		if (upgradeHeader !== "websocket") {
			const opts = defaultResponseOpts()
			opts.status = 400
			return new Response(JSON.stringify({error: "Expected websocket"}), opts)
		}
		const [clientSocket, serverSocket] = Object.values(new WebSocketPair())
		await this.handleSocketSession(request, serverSocket)
		return new Response(null, {
			status: 101,
			webSocket: clientSocket
		})
	}

	async handleSocketSession(request, ws) {
		ws.accept()
		ws.addEventListener("message", e => this.handleWebSocketMessage(request, ws, e))
		ws.addEventListener("close", () => {
			this.authedSockets = this.authedSockets.filter(w => !Object.is(w, ws))
		})
	}

	async handleWebSocketMessage(request, ws, event) {
		let data
		try {
			data = JSON.parse(event.data)
		} catch (e) {
			ws.send(JSON.stringify({message: "Send only JSON", error: "Bad request"}))
			return
		}
		if (data.get === "challenge") {
			this.challenge = await this.makeChallenge()
			ws.send(JSON.stringify({challenge: this.challenge.txt}))
			return
		}
		if (data.jwk && data.auth) {
			const isAuthenticated = await this.authenticate(data.jwk, getAuthPubKeyHashFromRequest(request), data.auth)
			if (isAuthenticated) {
				this.authedSockets.push(ws)
				ws.send(JSON.stringify({message: "Handshake done"}))
				const messages = await this.getStoredMessages()
				messages.forEach(m => {
					 ws.send(JSON.stringify(m))
				})
				await this.storeMessages([])
			} else {
				ws.send(JSON.stringify({message: "Nope. Try again...", error: "Authentication failed"}))
				ws.close()
			}
		}
		if (!this.authedSockets.find(w => Object.is(w, ws))) {
			ws.send(JSON.stringify({message: "Unauthorized", error: "Unauthorized"}))
			return
		}
		// WS is authed...

		if (data.t && data.m && data.h) {
			const messages = await this.getStoredMessages()
			messages.push(data)
			await this.storeMessages(messages)
		}
	}

	/**
		@param {Request} request
		@returns {Promise<Response>} Post message response
	*/
	async handlePostMessage(request) {
		const response = new Response(JSON.stringify({message: "Sent"}), defaultResponseOpts());
		const messageData = await request.json()
		if (Array.isArray(messageData)) {
			if (this.authedSockets.length > 0) {
				messageData.forEach(m => {
					this.authedSockets.forEach(ws => ws.send(JSON.stringify(m)))
				})
			} else {
				const messages = await this.getStoredMessages()
				messages.push(...messageData)
				await this.storeMessages(messages)
			}
		} else {
			if (this.authedSockets.length > 0) {
				this.authedSockets.forEach(ws => ws.send(JSON.stringify(messageData)))
			} else {
				const messages = await this.getStoredMessages()
				messages.push(messageData)
				await this.storeMessages(messages)
			}
		}
		return response
	}

	async makeChallenge() {
		const challengeHash = await hash(new TextEncoder().encode(crypto.randomUUID()))
		return {
			exp: Date.now()+this.challengeTtl,
			txt: base58().encode(new Uint8Array(challengeHash))
		}
	}

	async authenticate(jwk, publicKeyHash, auth) {
		const jwkBytes = new TextEncoder().encode(JSON.stringify(jwk))
		const jwkHash = await hash(jwkBytes)
		const b58 = base58()
		const jwkHashBase58 = b58.encode(new Uint8Array(jwkHash))
		// IMPORTANT verify publicKeyHash is equal to hash of public key
		if (jwkHashBase58 !== publicKeyHash) {
			return false
		}
		const authPubKey = await importAuthKey(jwk, ["verify"])
		const authChallengeBytes = b58.decode(auth)
		return await this.verifyChallenge(authPubKey, authChallengeBytes)
	}

		/**
		@param {CryptoKey} authPubKey Public auth key
		@param {Uint8Array} authChallengeBytes Signed challenge ByteArray
		@returns {Promise<boolean>} isVerified
	*/
	async verifyChallenge(authPubKey, authChallengeBytes) {
		if (hasChallengeExpired(this.challenge)) {
			return false
		}
		const challengeBytes = new TextEncoder().encode(this.challenge.txt)
		return await verify(authPubKey, authChallengeBytes, challengeBytes)
	}

	/**
		@returns {Promise<Object>} Promise for stored messages
	*/
	async getStoredMessages() {
		const stored = await this.state.storage.get(messagesKey)
		if (!stored) {
			return []
		}
		return JSON.parse(stored)
	}

	/**
		@param {Object[]} messages Array of messages
		@returns {Promise} stored
	*/
	async storeMessages(messages) {
		return await this.state.storage.put(messagesKey, JSON.stringify(messages))
	}
}