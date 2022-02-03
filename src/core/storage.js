import { toBase64 } from "../util/base64.js"
import { hash } from "../util/hash.js"
import { importAuthKey, importDHKey } from "./keys.js"

export function loadUser() {
  const user = {
    displayName: localStorage.displayName,
    avatarURL: localStorage.avatarURL,
    originURL: localStorage.originURL,
    keys: localStorage.keys && JSON.parse(localStorage.keys),
  }
  return user
}

export async function importUserKeys(keys) {
  const imported = {}
  Object.assign(imported, keys)
  Object.assign(imported.auth, {
    keyPair: {
      publicKey: await importAuthKey("jwk", imported.auth.jwk.publicKey, [
        "verify",
      ]),
      privateKey: await importAuthKey("jwk", imported.auth.jwk.privateKey, [
        "sign",
      ]),
    },
  })
  imported.auth.publicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", imported.auth.keyPair.publicKey)
  )
  imported.pubKeyHash = toBase64(
    new Uint8Array(await hash(imported.auth.publicKeyRaw))
  )
  Object.assign(imported.dh, {
    keyPair: {
      publicKey: await importDHKey("jwk", imported.dh.jwk.publicKey, []),
      privateKey: await importDHKey("jwk", imported.dh.jwk.privateKey, [
        "deriveKey",
        "deriveBits",
      ]),
    },
  })
  return imported
}

export function storeUser(userObject) {
  Object.entries(userObject).forEach(kv => {
    if (typeof kv[1] === "object") {
      localStorage.setItem(kv[0], JSON.stringify(kv[1]))
    } else {
      if (!kv[1]) {
        // remove undefined values
        localStorage.removeItem(kv[0])
      } else {
        localStorage.setItem(kv[0], kv[1])
      }
    }
  })
}
