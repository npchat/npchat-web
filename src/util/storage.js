import { importAuthKey, importDHKey } from "./keys.js"

export async function loadPreferences() {
	const pref = {
		showWelcome: !localStorage.showWelcome || localStorage.showWelcome === "true",
		displayName: localStorage.displayName,
		avatarURL: localStorage.avatarURL,
		originURL: localStorage.originURL,
		keys: localStorage.keys && JSON.parse(localStorage.keys),
		contacts: localStorage.contacts && JSON.parse(localStorage.contacts)
	}
	if (!pref.keys) {
		return pref
	}
	Object.assign(pref.keys.auth, {
		keyPair: {
			publicKey: await importAuthKey("jwk", pref.keys.auth.jwk.publicKey, ["verify"]),
			privateKey: await importAuthKey("jwk", pref.keys.auth.jwk.privateKey, ["sign"])
		}
	})
	pref.keys.auth.publicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", pref.keys.auth.keyPair.publicKey))
	Object.assign(pref.keys.dh, {
		keyPair: {
			publicKey: await importDHKey("jwk", pref.keys.dh.jwk.publicKey, []),
			privateKey: await importDHKey("jwk", pref.keys.dh.jwk.privateKey, ["deriveKey", "deriveBits"])
		}
	})
	return pref
}

export function storePreferences(preferencesObject) {
	Object.entries(preferencesObject).forEach(pref => {
		if (typeof pref[1] === "object") {
			localStorage.setItem(pref[0], JSON.stringify(pref[1]))
		} else {
			localStorage.setItem(pref[0], pref[1])
		}
	})
}