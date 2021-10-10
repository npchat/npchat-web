/**
	openchat implementation
	using Cloudflare Workers & Durable Objects
	https://developers.cloudflare.com/workers/learning/using-durable-objects
*/

const messagesKey = "messages"
const challengeKey = "challenge"
const hashAlgorithm = "SHA-256"
const sigKeyParams = {
	name: "ECDSA",
	namedCurve: "P-384"
}
const sigAlgorithm = {
	name: "ECDSA",
	hash: "SHA-384"
}

/**
	@returns {Object} default response options
*/
const defaultResponseOpts = () => { return {
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-ALlow-Methods": "POST, GET, OPTIONS",
		"Access-Control-Allow-Headers": "oc-pk, oc-sig",
		"Access-Control-Max-Age": 86400,
		"Vary": "Origin"
	},
	status: 200
	}
}

/**
	@param {Request} request
	@returns {String} sigPubJwkHashBase58
*/
const getSigPubJwkHashBase58FromRequest = request => {
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
	const sigPubJwkHashBase58 = getSigPubJwkHashBase58FromRequest(request)
	if (!sigPubJwkHashBase58) {
		opts.status = 400
		return new Response(JSON.stringify({error:"Missing sigPubJwkHashBase58"}), opts)
	}
  const id = env.CHANNEL.idFromName(sigPubJwkHashBase58)
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
		this.websocket = null
		//this.state.blockConcurrencyWhile(async () => )
	}

	async fetch(request) {
		const upgradeHeader = request.headers.get("Upgrade")
		if (upgradeHeader) {
			return await this.handleUpgrade(request, upgradeHeader)
		}
		const url = new URL(request.url)
		const segments = url.pathname.split("/")
		if (request.method === "GET" && segments.length > 1) {
			if (segments[segments.length-1] === challengeKey) {
				return this.handleGetChallengeRequest()
			}
			return this.handleGetMessagesRequest(request)
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

	async handleSocketSession(request, websocket) {
		websocket.accept()
		websocket.addEventListener("message", async event => {
			let message
			try {
				message = JSON.parse(event.data)
			} catch (e) {
				websocket.send(JSON.stringify({message: "Send only JSON", error: "Handshake failed"}))
				return
			}
			if (message.sigPubJwk && typeof message.challengeSig === "string") {
				const isAuthenticated = await this.authenticate(message.sigPubJwk, getSigPubJwkHashBase58FromRequest(request), message.challengeSig)
				if (isAuthenticated) {
					this.websocket = websocket
					websocket.send(JSON.stringify({message: "Handshake done"}))
				} else {
					websocket.send(JSON.stringify({message: "Nope. Try again..."}))
				}
			} else {
				websocket.send(JSON.stringify({message: "Missing sigPubJwk or challengeSig", error: "Missing parameters"}))
			}
		})
		websocket.addEventListener("close", () => {
			this.websocket = null
		})
	}

	/**
		@returns {Promise<Response>}
	*/
	async handleGetChallengeRequest() {
		return new Response(await this.getChallenge(), defaultResponseOpts())
	}

	/**
		@returns {Promise<Object>}
	*/
	async getChallenge() {
		const challenge = await this.state.storage.get(challengeKey)
		if (!challenge || this.hasChallengeExpired(JSON.parse(challenge))) {
			const newChallenge = JSON.stringify(this.makeChallenge())
			this.state.storage.put(challengeKey, newChallenge)
			return newChallenge
		}
		return challenge
	}

	/**
		@returns {Object} challenge
	*/
	makeChallenge() {
		return {exp: Date.now()+this.challengeTtl, txt: crypto.randomUUID()}
	}

	/**
		@param {Object} challenge
	*/
	hasChallengeExpired(challenge) {
		// check expiry (not t) to prevent issue when changing challengeTtl
		if (Date.now() > challenge.exp) {
			return true
		}
		return false
	}

	/**
		@param {Request} request
		@returns {Promise<Response>}
	*/
	async handleGetMessagesRequest(request) {
		const opts = defaultResponseOpts()
		if (await this.authenticateRequest(request) !== true) {
			opts.status = 401
			return new Response(JSON.stringify({error: "Unauthorized"}), opts)
		}
		const messages = await this.getStoredMessages()
		await this.storeMessages([])
		return new Response(JSON.stringify({messages: messages}), opts)
	}

	/**
		@param {Request} request
		@returns {Promise<boolean>} isAuthenticated
	*/
	async authenticateRequest(request) {
		const sigPubJwkBase58Header = request.headers.get("oc-pk")
		const signedChallengeBase58Header = request.headers.get("oc-sig")
		const sigPubJwkHashBase58 = getSigPubJwkHashBase58FromRequest(request)
		const sigPubJwkBytes = this.base58().decode(sigPubJwkBase58Header)
		const sigPubJwk = JSON.parse(new TextDecoder().decode(sigPubJwkBytes))
		return this.authenticate(sigPubJwk, sigPubJwkHashBase58, signedChallengeBase58Header)
	}

	async authenticate(sigPubJwk, sigPubJwkHashBase58, signedChallengeBase58) {
		const jwkBytes = new TextEncoder().encode(JSON.stringify(sigPubJwk))
		const jwkHash = await crypto.subtle.digest(hashAlgorithm, jwkBytes)
		const base58 = this.base58()
		const jwkHashBase58 = base58.encode(new Uint8Array(jwkHash))
		// IMPORTANT verify sigPubJwkHash is equal to hash of public key
		if (jwkHashBase58 !== sigPubJwkHashBase58) {
			return false
		}
		const jwk = JSON.parse(new TextDecoder().decode(jwkBytes))
		const sigPubKey = await this.importJwk(jwk)
		const signedChallengeBytes = base58.decode(signedChallengeBase58)
		return await this.verifyChallenge(sigPubKey, signedChallengeBytes)
	}

	/**
		@param {Request} request
		@returns {Promise<Response>} Post message response
	*/
	async handlePostMessage(request) {
		const response = new Response(JSON.stringify({message: "Sent"}), defaultResponseOpts());
		const newMessageText = await request.text()
		if (this.websocket) {
			this.websocket.send(newMessageText)
		}
		const messages = await this.getStoredMessages()
		messages.push(JSON.parse(newMessageText))
		await this.storeMessages(messages)
		return response
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

	/**
		@param {CryptoKey} sigPub Public signing key
		@param {Uint8Array} signedChallengeBytes Signed challenge ByteArray
		@returns {Promise<boolean>} isVerified
	*/
	async verifyChallenge(sigPub, signedChallengeBytes) {
		const challenge = JSON.parse(await this.state.storage.get(challengeKey))
		if (this.hasChallengeExpired(challenge)) {
			return false
		}
		const challengeBytes = new TextEncoder().encode(challenge.txt)
		return await crypto.subtle.verify(sigAlgorithm, sigPub, signedChallengeBytes, challengeBytes)
	}

	/**
		@param {Object} jwk JSON Web Token
		@returns {Promise<CryptoKey>} Promise for a CryptoKey
	*/
	async importJwk(jwk) {
		return crypto.subtle.importKey(
			"jwk",
			jwk,
			sigKeyParams,
			true,
			["verify"])
	}

	base58() {
		// https://github.com/45678/Base58
		const result = {}
		const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
		const ALPHABET_MAP = {}
		let i = 0
	
		while (i < ALPHABET.length) {
			ALPHABET_MAP[ALPHABET.charAt(i)] = i;
			i++
		}
	
		result.encode = buffer => {
			let carry, digits, j
			if (buffer.length === 0) {
				return ""
			}
			i = void 0
			j = void 0
			digits = [0]
			i = 0
			while (i < buffer.length) {
				j = 0
				while (j < digits.length) {
					digits[j] <<= 8
					j++
				}
				digits[0] += buffer[i]
				carry = 0
				j = 0
				while (j < digits.length) {
					digits[j] += carry
					carry = (digits[j] / 58) | 0
					digits[j] %= 58
					++j
				}
				while (carry) {
					digits.push(carry % 58)
					carry = (carry / 58) | 0
				}
				i++
			}
			i = 0
			while (buffer[i] === 0 && i < buffer.length - 1) {
				digits.push(0)
				i++
			}
			return digits.reverse().map(function(digit) {
				return ALPHABET[digit]
			}).join("")
		};
	
		result.decode = string => {
			let bytes, c, carry, j
			if (string.length === 0) {
				return new Uint8Array(0)
			}
			i = void 0
			j = void 0
			bytes = [0]
			i = 0
			while (i < string.length) {
				c = string[i]
				if (!(c in ALPHABET_MAP)) {
					throw "Base58.decode received unacceptable input. Character '" + c + "' is not in the Base58 alphabet."
				}
				j = 0
				while (j < bytes.length) {
					bytes[j] *= 58
					j++
				}
				bytes[0] += ALPHABET_MAP[c]
				carry = 0
				j = 0
				while (j < bytes.length) {
					bytes[j] += carry
					carry = bytes[j] >> 8
					bytes[j] &= 0xff
					++j
				}
				while (carry) {
					bytes.push(carry & 0xff)
					carry >>= 8
				}
				i++
			}
			i = 0
			while (string[i] === "1" && i < string.length - 1) {
				bytes.push(0)
				i++
			}
			return new Uint8Array(bytes.reverse())
		}
	
		return result
	}
}