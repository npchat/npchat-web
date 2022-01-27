import { pack, unpack } from "msgpackr"
import { sign } from "../util/auth.js"

export async function authenticateSocket(socket, privateKey, publicKeyRaw) {
  return new Promise((resolve, reject) => {
    // handle response message
    socket.addEventListener(
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
    socket.addEventListener(
      "open",
      async () => {
        const time = new TextEncoder().encode(Date.now().toString())
        const buffer = pack({
          time,
          sig: new Uint8Array(await sign(privateKey, time)),
          publicKey: publicKeyRaw,
        })
        socket.send(buffer)
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
