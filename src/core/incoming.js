import { unpack } from "msgpackr"
import { toBase64 } from "../util/base64.js"
import { decrypt } from "../util/privacy.js"
import { openDBConn } from "./db.js"
import { deriveDHSecret, importAuthKey, importDHKey } from "./keys.js"
import { verifyMessage } from "./message.js"

export async function handleIncomingMessage(msg, myKeys) {
  if (!(msg.data instanceof Blob)) return
  const arrayBuffer = await msg.data.arrayBuffer()
  const data = unpack(new Uint8Array(arrayBuffer))
  if (!data.m || !data.f) return

  // match contact &
  // check message does not already exist
  const fromPubKeyHash = toBase64(data.f)
  const db = await openDBConn()
  const contact = await db.get("contacts", fromPubKeyHash)
  const stored = await db.get("messages", data.t)
  if (!contact || stored) {
    db.close()
    return
  }

  // verify signature
  const authKey = await importAuthKey("jwk", contact.keys.auth, ["verify"])
  const isVerified = await verifyMessage(authKey, data)
  if (!isVerified) return

  // decrypt
  const dhPublicKey = await importDHKey("jwk", contact.keys.dh, [])
  const dhSecret = await deriveDHSecret(
    dhPublicKey,
    myKeys.dh.keyPair.privateKey
  )
  const decrypted = await decrypt(data.iv, dhSecret, data.m)

  try {
    const unpacked = unpack(new Uint8Array(decrypted))
    window.dispatchEvent(
      new CustomEvent("packedMessageReceived", {
        detail: { unpacked, contact },
      })
    )
  } catch {
    const msgPlainText = new TextDecoder().decode(decrypted)
    // store
    const toStore = {
      t: data.t,
      h: toBase64(data.h),
      m: msgPlainText,
      with: fromPubKeyHash,
      in: true,
    }
    await db.put("messages", toStore, data.t)

    const eventDetail = {
      displayName: contact.displayName,
    }
    Object.assign(eventDetail, toStore)
    window.dispatchEvent(
      new CustomEvent("messageReceived", {
        detail: eventDetail,
      })
    )
  }
  db.close()
}
