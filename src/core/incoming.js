import { unpack } from "msgpackr"
import { toBase64 } from "../util/base64"
import { decrypt } from "../util/privacy"
import { deriveDHSecret, importAuthKey, importDHKey } from "./keys"
import { verifyMessage } from "./message"

export async function handleIncomingMessage(msg, db, myKeys) {
  if (!(msg.data instanceof Blob)) return
  const arrayBuffer = await msg.data.arrayBuffer()
  const data = unpack(new Uint8Array(arrayBuffer))
  if (!data.m || !data.f) return

  // match contact
  const fromPubKeyHash = toBase64(data.f)
  const contact = await db.get("contacts", fromPubKeyHash)
  if (!contact) return

  // check does not already exist
  const stored = await db.get("messages", data.t)
  if (stored) return

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
}
