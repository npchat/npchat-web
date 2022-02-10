import { pack } from "msgpackr"
import { toBase64 } from "../util/base64"

/*
export function amIPolitePeer(myPubKeyHash, peerPubKeyHash) {
  const myPkh = fromBase64(myPubKeyHash)
  const peerPhk = fromBase64(peerPubKeyHash)
  for (let i = 0; i < myPkh.length; i++) {
    if (myPkh[i] > peerPhk[i]) return false
    if (peerPhk[i] > myPkh[i]) return true
  }
}
*/

async function getTurnServer(authObject, pubKeyHash) {
  const endpoint = new URL(`${pubKeyHash}/turn`, localStorage.originURL)
  const auth = toBase64(pack(authObject))
  const response = await fetch(endpoint, {
    headers: { "Authorization": auth }
  })
  if (response.status !== 200) return
  return response.json()
}

export async function getIceConfig(authObject, pubKeyHash) {
  const turnServer = await getTurnServer(authObject, pubKeyHash)
  const config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      }
    ]
  }
  config.iceServers.push(turnServer)
  return config
}