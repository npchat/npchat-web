const messagesKey = "messages"
const challengeKey = "challenge"
const hashAlgorithm = "SHA-256"
const ecKeyImportParams = {
	name: "ECDSA",
	namedCurve: "P-384"
}
const signingAlgorithm = {
	name: "ECDSA",
	hash: "SHA-384"
}
const defaultResponseOpts = () => { return {
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-ALlow-Methods": "POST, GET, OPTIONS",
		"Access-Control-Allow-Headers": "oc-pkh, oc-pk, oc-sig",
		"Access-Control-Max-Age": 86400,
		"Vary": "Origin"
	},
	status: 200
	}
}

const getPubKeyHashFromRequest = request => {
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
		return new Response('Allowed methods: GET, POST, OPTIONS', defaultResponseOpts())
	}

	
	const pubKeyHash = getPubKeyHashFromRequest(request)
	if (!pubKeyHash) {
		const opts = defaultResponseOpts()
		opts.status = 401
		return new Response('Missing pubKeyHash', opts)
	}
  const id = env.CHANNEL.idFromName(pubKeyHash);
  const obj = env.CHANNEL.get(id);

	switch(request.method) {
		case "GET":
			return await obj.fetch(request.url, {headers: request.headers})
		case "POST":
			return await obj.fetch(request.url, {
				method: request.method,
				headers: request.headers,
				body: request.body
			})
		default:
			return new Response("Method not supported", defaultResponseOpts())
	}
}

export class Channel {
	constructor(state, env) {
		this.state = state
		this.challengeTtl = env.CHALLENGE_TTL
		//this.state.blockConcurrencyWhile(async () => )
	}

	async fetch(request) {
		const url = new URL(request.url)
		const segments = url.pathname.split("/")
		if (request.method === "GET") {
			if (segments[segments.length-1] === challengeKey) {
				return this.handleGetChallenge()
			}
			return this.handleGetMessages(request)
		}
		if (request.method === "POST") {
			return this.handlePostMessage(request)
		}
		return new Response("Hello chatter", defaultResponseOpts());
	}

	async handleGetChallenge() {
		const challenge = await this.state.storage.get(challengeKey)
		if (!challenge || this.hasChallengeExpired(JSON.parse(challenge))) {
			const newChallenge = JSON.stringify(this.makeChallenge());
			this.state.storage.put(challengeKey, newChallenge)
			return new Response(newChallenge, defaultResponseOpts())
		}
		return new Response(challenge, defaultResponseOpts())
	}

	makeChallenge() {
		return {timestamp: Date.now(), text: crypto.randomUUID()}
	}

	hasChallengeExpired(challenge) {
		if (Date.now() - challenge.timestamp > this.challengeTtl) {
			return true
		}
		return false
	}

	async handleGetMessages(request) {
		const opts = defaultResponseOpts()
		if (await this.authenticate(request) !== true) {
			opts.status = 401
			return new Response(JSON.stringify({error: "Unauthorized"}), opts)
		}
		const messages = await this.getStoredMessages()
		await this.storeMessages([])
		return new Response(JSON.stringify({messages: messages}), opts)
	}

	async authenticate(request) {
		const pubKeyHeader = request.headers.get("oc-pk")
		const signedChallengeHeader = request.headers.get("oc-sig")
		if (!pubKeyHeader || !signedChallengeHeader) {
			return false
		}
		const pubKeyHash = getPubKeyHashFromRequest(request)
		const base58 = this.base58()
		const jwkBytes = base58.decode(pubKeyHeader)
		const jwkHash = await crypto.subtle.digest(hashAlgorithm, jwkBytes)
		const jwkHashBase58 = base58.encode(new Uint8Array(jwkHash))
		if (jwkHashBase58 !== pubKeyHash) {
			return false
		}
		const jwk = JSON.parse(new TextDecoder().decode(jwkBytes))
		const pubKey = await this.importJwk(jwk)
		const signedChallengeBytes = base58.decode(signedChallengeHeader)
		return await this.verifyChallenge(pubKey, signedChallengeBytes)
	}

	async handlePostMessage(request) {
		const newMessage = await request.json()
		const messages = await this.getStoredMessages()
		messages.push(newMessage)
		await this.storeMessages(messages)
		return new Response(JSON.stringify({message: "Stored"}), defaultResponseOpts())
	}

	async getStoredMessages() {
		const stored = await this.state.storage.get(messagesKey)
		if (!stored) {
			return []
		}
		return JSON.parse(stored)
	}

	async storeMessages(messages) {
		return await this.state.storage.put(messagesKey, JSON.stringify(messages))
	}

	async verifyChallenge(publicKey, signedChallengeBytes) {
		const challenge = JSON.parse(await this.state.storage.get(challengeKey))
		const challengeBytes = new TextEncoder().encode(challenge.text)
		return await crypto.subtle.verify(signingAlgorithm, publicKey, signedChallengeBytes, challengeBytes)
	}

	async importJwk(jwk) {
		return crypto.subtle.importKey(
			"jwk",
			jwk,
			ecKeyImportParams,
			true,
			["verify"])
	}

	base58() {
		// https://github.com/45678/Base58
		const result = {}
		const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
		const ALPHABET_MAP = {};
		let i = 0;
	
		while (i < ALPHABET.length) {
			ALPHABET_MAP[ALPHABET.charAt(i)] = i;
			i++;
		}
	
		result.encode = buffer => {
			let carry, digits, j;
			if (buffer.length === 0) {
				return "";
			}
			i = void 0;
			j = void 0;
			digits = [0];
			i = 0;
			while (i < buffer.length) {
				j = 0;
				while (j < digits.length) {
					digits[j] <<= 8;
					j++;
				}
				digits[0] += buffer[i];
				carry = 0;
				j = 0;
				while (j < digits.length) {
					digits[j] += carry;
					carry = (digits[j] / 58) | 0;
					digits[j] %= 58;
					++j;
				}
				while (carry) {
					digits.push(carry % 58);
					carry = (carry / 58) | 0;
				}
				i++;
			}
			i = 0;
			while (buffer[i] === 0 && i < buffer.length - 1) {
				digits.push(0);
				i++;
			}
			return digits.reverse().map(function(digit) {
				return ALPHABET[digit];
			}).join("");
		};
	
		result.decode = string => {
			let bytes, c, carry, j;
			if (string.length === 0) {
				return new(typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(0);
			}
			i = void 0;
			j = void 0;
			bytes = [0];
			i = 0;
			while (i < string.length) {
				c = string[i];
				if (!(c in ALPHABET_MAP)) {
					throw "Base58.decode received unacceptable input. Character '" + c + "' is not in the Base58 alphabet.";
				}
				j = 0;
				while (j < bytes.length) {
					bytes[j] *= 58;
					j++;
				}
				bytes[0] += ALPHABET_MAP[c];
				carry = 0;
				j = 0;
				while (j < bytes.length) {
					bytes[j] += carry;
					carry = bytes[j] >> 8;
					bytes[j] &= 0xff;
					++j;
				}
				while (carry) {
					bytes.push(carry & 0xff);
					carry >>= 8;
				}
				i++;
			}
			i = 0;
			while (string[i] === "1" && i < string.length - 1) {
				bytes.push(0);
				i++;
			}
			return new(typeof Uint8Array !== "undefined" && Uint8Array !== null ? Uint8Array : Buffer)(bytes.reverse());
		};
	
		return result
	}
}