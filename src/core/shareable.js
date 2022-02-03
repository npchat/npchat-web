import { importUserKeys, loadUser } from "./storage"

export const protocolScheme = "web+npchat"

export function registerProtocolHandler() {
  if (typeof navigator.registerProtocolHandler !== "function") return
  navigator.registerProtocolHandler(
    protocolScheme,
    `${window.location.origin}#%s`,
    "npchat shareable"
  )
}

export function getDataFromURL() {
  if (!window.location.hash.startsWith(protocolScheme)) return
  return decodeURIComponent(window.location.hash).slice(
    protocolScheme.length + 2
  )
}

export function buildShareableURL(originURL, pubKeyHash) {
  return `${protocolScheme}:${originURL}/${pubKeyHash}/shareable`
}

export async function fetchShareableUsingURLData() {
  const urlData = getDataFromURL()
  if (urlData) {
    try {
      const resp = await fetch(urlData)
      return resp.json()
    } catch (e) {
      console.log("failed to import data from URL", e)
    }
  }
}

export function buildShareableData(keys) {
  const user = loadUser()
  return new TextEncoder().encode(
    JSON.stringify({
      displayName: user.displayName,
      avatarURL: user.avatarURL,
      originURL: user.originURL,
      keys: {
        auth: keys.auth.jwk.publicKey,
        dh: keys.dh.jwk.publicKey,
        pubKeyHash: keys.pubKeyHash,
      },
    })
  )
}
