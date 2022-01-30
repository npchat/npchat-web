import { toBase64 } from "../../src/util/base64"
import { keyTtl } from "./index"

export function validateAuth(request) {
	const authHeader = request.headers.get("authorization")
	if (authHeader === AUTH) return true
}

export async function store(data, mimeType, force = false) {
	const hash = await digest(data)
	const key = buildKey(hash, mimeType)

	let getCurrentValuePromise
	if (force) {
		getCurrentValuePromise = Promise.resolve(null)
	} else {
		getCurrentValuePromise = NPCHAT_MEDIA.get(key, {type:"arrayBuffer"})
	}
	const currentValue = await getCurrentValuePromise

	if (!currentValue) {
		const options = {
			expirationTtl: keyTtl,
			metadata: {
				expires: Date.now() + keyTtl * 1000
			}
		}
		await NPCHAT_MEDIA.put(key, data, options)
	}

	return key
}

export function getKeyFromRequestUrl(requestUrl) {
	const [,type,subtype,hash] = new URL(requestUrl).pathname.split("/")
	return `${type}/${subtype}/${hash}`
}

export function getMimeTypeFromKey(key) {
	const [type, subtype,] = key.split("/")
	return `${type}/${subtype}`
}

export function getMimeTypeFromRequest(request) {
	return request.headers.get("content-type")
}

async function digest(arrayBuffer) {
	return new Uint8Array(await crypto.subtle.digest("SHA-256", arrayBuffer))
}

function buildKey(hash, mimeType) {
	return `${mimeType}/${toBase64(hash)}`
}