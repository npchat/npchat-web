import { unpack } from "msgpackr"
import { fromBase64 } from "../util/base64"
import { getJwkFromValues, getValuesFromJwk } from "./keys"
import { loadUser, storeUser } from "./storage"

export async function getUserExportData() {
  const user = await loadUser()
  const { keys } = user
  if (!keys) return
  const toExport = {
    originURL: user.originURL,
    authPub: getValuesFromJwk(keys.auth.jwk.publicKey),
    authPriv: getValuesFromJwk(keys.auth.jwk.privateKey),
    dhPub: getValuesFromJwk(keys.dh.jwk.publicKey),
    dhPriv: getValuesFromJwk(keys.dh.jwk.privateKey),
  }
  return toExport
}

/**
 * Takes an object containing:
 * originURL: URL string with protocol (http/https) & domain
 * authPub: { x, y } values for auth pub key
 * authPriv: { x, y, d } values for auth priv key
 * dhPub: { x, y } values for DH pub key
 * dhPriv: { x, y, d } values for DH priv key
 * @param {Object} userData
 * @returns {Object} user with imported keys
 */
export async function importUserData(data) {
  const user = {
    originURL: data.originURL,
    keys: {
      auth: {
        jwk: {
          publicKey: getJwkFromValues(data.authPub, ["verify"]),
          privateKey: getJwkFromValues(data.authPriv, ["sign"]),
        },
      },
      dh: {
        jwk: {
          publicKey: getJwkFromValues(data.dhPub, []),
          privateKey: getJwkFromValues(data.dhPriv, [
            "deriveKey",
            "deriveBits",
          ]),
        },
      },
    },
  }
  // store & load to import keys
  storeUser(user)
  return loadUser()
}

export async function importUserDataFromURL() {
  let data = window.location.hash
  if (!data.startsWith("#import:")) return false
  history.pushState(null, "", "/")
  data = data.replace("#import:", "")
  const bytes = fromBase64(data)
  const unpacked = unpack(bytes)
  const userData = await importUserData(unpacked)
  if (!userData) return false
  storeUser(userData)
  return true
}
