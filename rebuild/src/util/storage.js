export function loadPreferences() {
	return {
		showWelcome: !localStorage.showWelcome || localStorage.showWelcome === "true",
		displayName: localStorage.displayName,
		avatarURL: localStorage.avatarURL,
		originURL: localStorage.originURL
	}
}

export function storePreferences(preferencesObject) {
	Object.entries(preferencesObject).forEach(pref => {
		localStorage.setItem(pref[0], pref[1])
	})
}