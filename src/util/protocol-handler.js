const scheme = "web+npchat"

export function registerProtocolHandler() {
	navigator.registerProtocolHandler(scheme, `${window.location.origin}#%s`, "npchat shareable")
}

export function getDataFromURL() {
	if (!window.location.hash) return
	return decodeURIComponent(window.location.hash)
			.slice(scheme.length+2)
}