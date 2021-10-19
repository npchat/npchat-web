import { deriveDHSecret, importAuthKey, importDHKey } from "../../../util/key";
import { sendMessage, buildMessage, verifyMessage } from "../util/message"
import { decrypt } from "../../../util/privacy";
import { base64ToBytes } from "../../../util/base64";

const messagesKey = "messages"

export class MessageController {
	host;
  list = []

	constructor(host) {
		this.host = host
		host.addController(this)
	}

	store() {
		localStorage.setItem(messagesKey, JSON.stringify(this.list))
	}

	init() {
		const stored = localStorage.getItem(messagesKey)
    try {
      const parsed = JSON.parse(stored)
      this.list = parsed || []
    } catch (e) {
      console.log("Failed to parse stored messages")
      this.list = []
    }
  }

	async handleReceivedMessage(data, doStore) {
    if (!data.t || !data.iv || !data.m || !data.f || !data.h || !data.s) {
      return
    }
    const exists = this.list.find(m => m.h === data.h)
    if (exists) {
      return
    }
    const contactMatch = this.host.contact.list.find(c => c.keys.auth.publicKeyHash === data.f)
    // we need a contactMatch to get the public key, & the message must contain a hash & sig
    if (!contactMatch || !contactMatch.keys) {
      return
    }
    const authPubRaw = base64ToBytes(contactMatch.keys.auth.base64)
    const authPub = await importAuthKey("raw", authPubRaw, ["verify"])
    const isVerified = await verifyMessage(authPub, data)
    if (!isVerified) {
      console.log("Rejected unverified message", data)
      return
    }
    const ivBytes = base64ToBytes(data.iv)
    const mBytes = base64ToBytes(data.m)

    const dhPubRaw = base64ToBytes(contactMatch.keys.dh.base64)
    const dhPub = await importDHKey("raw", dhPubRaw, [])
    const derivedKey = await deriveDHSecret(dhPub, this.host.pref.keys.dh.keyPair.privateKey)

    const messagePlainBytes = new Uint8Array(await decrypt(ivBytes, derivedKey, mBytes))

    const storable = data
    storable.mP = new TextDecoder().decode(messagePlainBytes)
    this.list.push(storable)
    if (doStore) {
      this.store()
    }
    this.host.requestUpdate()
    return isVerified
  }

	async handleSendMessage(messageText) {
		messageText = messageText.trim()
    if (messageText.length < 1) {
      return
    }
    const contact = this.host.contact.selected
    if (!contact || !contact.keys) {
      return
    }
    const myKeys = this.host.pref.keys
    const message = await buildMessage(myKeys.auth.keyPair.privateKey, myKeys.dh.keyPair.privateKey, messageText, myKeys.auth.publicKeyHash, contact.keys.dh.base64)
    const res = await sendMessage(contact.domain, contact.keys.auth.publicKeyHash, message)
    if (res.error) {
      console.log("Failed to send message", res)
      return
    }
    message.mP = messageText
    message.to = contact.keys.auth.publicKeyHash
    this.list.push(message)
    this.store()
    this.host.requestUpdate()
	}

  pushAll() {
    this.list.forEach(m => {
      let mCleaned = m;
      Object.assign(mCleaned, {mP: undefined})
      try {
        this.host.websocket.socket.send(JSON.stringify(mCleaned))
      } catch (e) {
        console.log("Failed to push messages")
      }
    })
  }
}



