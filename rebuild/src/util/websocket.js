import {pack} from "msgpackr/pack"
import {sign} from "./auth.js"

export async function authenticateSocket(socket, privateKey, publicKeyRaw) {
	return new Promise(resolve => {
		// handle auth message
		socket.addEventListener("message", data => {
			console.log("got response message", data)
			resolve()
		}, {once: true})

		// send auth solution
		// {t, sig(t), publicKey}
		socket.addEventListener("open", async () => {
			const t = new TextEncoder().encode(Date.now().toString())
			console.log(publicKeyRaw)
			const buf = pack({
				pubKey: publicKeyRaw,
				t,
				sig: new Uint8Array(await sign(privateKey, t))
			})
			socket.send(buf)
			console.log("socket open, sending auth solution...", buf.length)
		}, {once: true})
	})
}

/**
 * URL string
 * {originURL}/{pubKeyHash}
 * @param {*} url 
 * @returns 
 */
export async function getWebSocket(url) {
	let fixed = url
	// check for redirect
	const resp = await fetch(url)
	if (resp.redirected) {
		fixed = resp.url
	}
	// http -> ws & https -> wss
	fixed = fixed.replace("http://", "ws://")
	fixed = fixed.replace("https://", "wss://")
	return new WebSocket(fixed)
}