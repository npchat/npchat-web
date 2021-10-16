/**
	npchat protocol JS implementation
	a Cloudflare Worker using Durable Objects
	https://developers.cloudflare.com/workers/learning/using-durable-objects
*/

import { genAuthKeyPair, importAuthKey } from '../../util/key'
import { sign, verify } from '../../util/auth'
import { base58 } from '../../util/base58'
import { hash } from '../../util/hash'

/**
	@returns {Object} default response options
*/
const defaultResponseOpts = () => {
	return {
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
	- messages

	Environment sets:
	- challengeTtl
*/
export class Channel {
	constructor(state, env) {
		this.state = state
		this.state.blockConcurrencyWhile(async () => {
			this.messages = await this.getStoredMessages()
			this.keyPair = await genAuthKeyPair()
		})
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
			ws.send(JSON.stringify({challenge: await this.makeChallenge()}))
			return
		}
		if (data.jwk && data.challenge && data.solution) {
			const isAuthenticated = await this.authenticate(data, getAuthPubKeyHashFromRequest(request))
			if (isAuthenticated) {
				this.authedSockets.push(ws)
				ws.send(JSON.stringify({message: "Handshake done"}))
				this.messages.forEach(m => {
					 ws.send(JSON.stringify(m))
				})
				await this.storeMessages([])
				this.messages = []
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
			this.messages.push(data)
			await this.storeMessages(this.messages)
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
				this.messages.push(...messageData)
				await this.storeMessages(this.messages)
			}
		} else {
			if (this.authedSockets.length > 0) {
				this.authedSockets.forEach(ws => ws.send(JSON.stringify(messageData)))
			} else {
				this.messages.push(messageData)
				await this.storeMessages(this.messages)
			}
		}
		return response
	}

	async makeChallenge() {
		// timecode is only used to salt the UUID
		const randomBytes = new TextEncoder().encode(crypto.randomUUID()+Date.now())
		const challengeBytes = new Uint8Array(await hash(randomBytes))
		const challengeSignature = new Uint8Array(await sign(this.keyPair.privateKey, challengeBytes))
		const b58 = base58()
		return {
			txt: b58.encode(challengeBytes),
			sig: b58.encode(challengeSignature)
		}
	}

	async authenticate(data, publicKeyHash) {
		const jwkBytes = new TextEncoder().encode(JSON.stringify(data.jwk))
		const jwkHash = new Uint8Array(await hash(jwkBytes))
		const b58 = base58()
		const jwkHashBase58 = b58.encode(jwkHash)
		// verify publicKeyHash is equal to hash of public key
		if (jwkHashBase58 !== publicKeyHash) {
			return false
		}
		const solutionBytes = b58.decode(data.solution)
		const authPublicKey = await importAuthKey(data.jwk, ["verify"])
		return await this.verifyChallenge(data.challenge, solutionBytes, authPublicKey)
	}

	async verifyChallenge(challenge, solutionBytes, authPublicKey) {
		const b58 = base58()
		const challengeSignature = b58.decode(challenge.sig)
		const challengeBytes = b58.decode(challenge.txt)
		const isChallengeAuthentic = await verify(this.keyPair.publicKey, challengeSignature, challengeBytes)
		if (!isChallengeAuthentic) return false
		const isChallengeSolutionValid = await verify(authPublicKey, solutionBytes, challengeBytes)
		if (!isChallengeSolutionValid) return false
		return true
	}

	async getStoredMessages() {
		const stored = await this.state.storage.get("messages")
		if (!stored) {
			return []
		}
		return JSON.parse(stored)
	}

	async storeMessages(messages) {
		return await this.state.storage.put("messages", JSON.stringify(messages))
	}
}