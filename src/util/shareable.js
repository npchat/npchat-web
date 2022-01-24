const protocolScheme = "web+npchat"

export function registerProtocolHandler() {
	navigator.registerProtocolHandler(protocolScheme, `${window.location.origin}#%s`, "npchat shareable")
}

export function getDataFromURL() {
	if(!window.location.hash) return
	return decodeURIComponent(window.location.hash)
			.slice(protocolScheme.length+2)
}

export function buildShareableProtocolURL(originURL, pubKeyHash) {
	return `${protocolScheme}:${originURL}/${pubKeyHash}/shareable`
}

export function buildShareableFallback(originURL, pubKeyHash) {
	return `${originURL}/${pubKeyHash}/shareable`
}

export function buildShareableFallbackURL(originURL, pubKeyHash) {
	const shareable = buildShareableFallback(originURL, pubKeyHash)
	return `${window.location.origin}#${protocolScheme}:${shareable}`
}