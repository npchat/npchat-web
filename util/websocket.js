export function getWebSocket(domain, sigPubJwkHash) {
	return new WebSocket(`wss://${domain}/${sigPubJwkHash}`)
}

export function handshakeWebsocket(websocket, sigPubJwk, challengeSig) {
	websocket.send(JSON.stringify({sigPubJwk, challengeSig}))
}