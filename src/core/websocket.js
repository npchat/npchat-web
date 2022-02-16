import { pack } from "msgpackr"
import { toBase64 } from "../util/base64"

/**
 * URL string
 * {originURL}/{pubKeyHash}
 * @param {*} url
 * @returns
 */
export function getWebSocket(url, authObject) {
  let fixed = url

  // http -> ws & https -> wss
  fixed = fixed.replace("http://", "ws://")
  fixed = fixed.replace("https://", "wss://")

  // add auth as query param
  const auth = toBase64(pack(authObject))
  fixed += "?auth="+auth
  return new WebSocket(fixed)
}

export function push(object) {
  if (window.socket && window.socket.readyState === WebSocket.OPEN) {
    window.socket.send(pack(object))
    return true
  }
  return false
}