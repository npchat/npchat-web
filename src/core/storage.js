import { toBase64 } from "../util/base64.js"
import { hash } from "../util/hash.js"
import { importAuthKey, importDHKey } from "./keys.js"

export async function loadUser() {
  const user = {
    showWelcome:
      !localStorage.showWelcome || localStorage.showWelcome === "true",
    displayName: localStorage.displayName,
    avatarURL: localStorage.avatarURL,
    originURL: localStorage.originURL,
    keys: localStorage.keys && JSON.parse(localStorage.keys),
  }
  if (!user.keys) {
    return user
  }
  Object.assign(user.keys.auth, {
    keyPair: {
      publicKey: await importAuthKey("jwk", user.keys.auth.jwk.publicKey, [
        "verify",
      ]),
      privateKey: await importAuthKey("jwk", user.keys.auth.jwk.privateKey, [
        "sign",
      ]),
    },
  })
  user.keys.auth.publicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", user.keys.auth.keyPair.publicKey)
  )
  user.keys.pubKeyHash = toBase64(
    new Uint8Array(await hash(user.keys.auth.publicKeyRaw))
  )
  Object.assign(user.keys.dh, {
    keyPair: {
      publicKey: await importDHKey("jwk", user.keys.dh.jwk.publicKey, []),
      privateKey: await importDHKey("jwk", user.keys.dh.jwk.privateKey, [
        "deriveKey",
        "deriveBits",
      ]),
    },
  })
  return user
}

export function storeUser(userObject) {
  Object.entries(userObject).forEach(kv => {
    if (typeof kv[1] === "object") {
      localStorage.setItem(kv[0], JSON.stringify(kv[1]))
    } else {
      localStorage.setItem(kv[0], kv[1])
    }
  })
}
