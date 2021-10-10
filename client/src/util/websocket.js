export function getWebSocket(host, sigPubJwkHash) {
	return new WebSocket(`wss://${host}/${sigPubJwkHash}`)
}

export function handshakeWebsocket(websocket, sigPubJwk, challengeSig) {
	websocket.send(JSON.stringify({sigPubJwk, challengeSig}))
}