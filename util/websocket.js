export function getWebSocket(domain, publicKeyHash) {
	return new WebSocket(`wss://${domain}/${publicKeyHash}`)
}