import { importAuthKey, getBytesFromPrivateCryptoKey } from "./keys.js"

export async function loadPreferences() {
	const pref = {
		showWelcome: !localStorage.showWelcome || localStorage.showWelcome === "true",
		displayName: localStorage.displayName,
		avatarURL: localStorage.avatarURL,
		originURL: localStorage.originURL,
		keys: localStorage.keys && JSON.parse(localStorage.keys)
	}
	if (!pref.keys) {
		return pref
	}
	// import keys
	Object.assign(pref.keys.auth, {
		keyPair: {
			publicKey: await importAuthKey("jwk", pref.keys.auth.jwk.publicKey, ["verify"]),
			privateKey: await importAuthKey("jwk", pref.keys.auth.jwk.privateKey, ["sign"])
		}
	})
	Object.assign(pref.keys.auth, {
		raw: {
			publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", pref.keys.auth.keyPair.publicKey)),
			privateKey: await getBytesFromPrivateCryptoKey(pref.keys.auth.keyPair.privateKey)
		}
	})
	// TODO: import DH keys
	console.log("imported!", pref)
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