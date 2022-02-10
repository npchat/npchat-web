import { pack, unpack } from "msgpackr"
import { buildAuthObject } from "./auth.js"

export async function authenticateSocket(privateKey, publicKeyRaw) {
  return new Promise((resolve, reject) => {
    // handle response message
    window.socket.addEventListener(
      "message",
      async msg => {
        try {
          const arrayBuffer = await msg.data.arrayBuffer()
          const data = unpack(new Uint8Array(arrayBuffer))
          resolve(data)
        } catch (e) {
          reject(e)
        }
      },
      { once: true }
    )

    // send auth solution
    window.socket.addEventListener(
      "open",
      async () => {
        const buffer = pack(await buildAuthObject(privateKey, publicKeyRaw))
        window.socket.send(buffer)
      },
      { once: true }
    )
  })
}

/**
 * URL string
 * {originURL}/{pubKeyHash}
 * @param {*} url
 * @returns
 */
export async function getWebSocket(url) {
  let fixed = url
  // check for redirect
  const resp = await fetch(url)
  if (resp.redirected) {
    fixed = resp.url
  }
  // http -> ws & https -> wss
  fixed = fixed.replace("http://", "ws://")
  fixed = fixed.replace("https://", "wss://")
  return new WebSocket(fixed)
}

export function push(object) {
  if (window.socket && window.socket.readyState === WebSocket.OPEN) {
    window.socket.send(pack(object))
    return true
  }
  return false
}
