export async function handleIncomingMessage(msg, db) {
  if (!(msg.data instanceof Blob)) return
  const arrayBuffer = await msg.data.arrayBuffer()
  const data = unpack(new Uint8Array(arrayBuffer))
  if (!data.m || !data.f) return

  // match contact
  const fromPubKeyHash = toBase64(data.f)
  const contact = await db.get("contacts", fromPubKeyHash)
  if (!contact) return

  // check does not already exist
  const hashB64 = toBase64(data.h)
  const stored = await db.get("messages", hashB64)
  if (stored) return

  // verify signature
  const authKey = await importAuthKey("jwk", contact.keys.auth, ["verify"])
  const isVerified = await verifyMessage(authKey, data)
  if (!isVerified) return

  // decrypt
  const dhPublicKey = await importDHKey("jwk", contact.keys.dh, [])
  const dhSecret = await deriveDHSecret(
    dhPublicKey,
    this.keys.dh.keyPair.privateKey
  )
  const decrypted = await decrypt(data.iv, dhSecret, data.m)
  const msgPlainText = new TextDecoder().decode(decrypted)

  // store
  const toStore = {
    t: data.t,
    h: hashB64,
    m: msgPlainText,
    f: fromPubKeyHash
  }
  await db.put("messages", toStore)

  const eventDetail = {
    displayName: contact.displayName
  }
  Object.assign(eventDetail, toStore)
  window.dispatchEvent(new CustomEvent("messageReceived", {
    detail: eventDetail
  }))


  /*
  // notify
  if (!this.selectedContact?.keys.pubKeyHash === fromPubKeyHash) {
    const preview = `${msgPlainText.slice(0, 25)}${
      msgPlainText.length > 25 ? "..." : ""
    }`
    this.toast.show(`${contact.displayName}: ${preview}`)
  }

  localStorage.lastMessageFrom = fromPubKeyHash
  */
}