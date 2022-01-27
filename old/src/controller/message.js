import { deriveDHSecret, importAuthKey, importDHKey } from "../util/key";
import { sendMessage, buildMessage, verifyMessage } from "../util/message"
import { decrypt } from "../util/privacy";
import { base64ToBytes } from "../util/base64";

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

	async init() {
		const stored = localStorage.getItem(messagesKey)
    try {
      const parsed = JSON.parse(stored)
      this.list = parsed || []
    } catch (e) {
      console.log("Failed to parse stored messages")
      this.list = []
    }
  }

	async handleReceivedMessage(data) {
    if (!data.t || !data.iv || !data.m || !data.f || !data.h || !data.s) {
      return
    }
    const exists = this.list.find(m => m.h === data.h)
    if (exists) {
      return
    }
    // we need a contactMatch to get the public key
    const contactMatch = this.host.contact.list.find(c => c.keys.auth.publicKeyHash === data.f)
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

    const plain = new TextDecoder().decode(messagePlainBytes)
    
    const storable = data
    storable.mP = plain
    this.list.push(storable)
    this.list = this.list.sort((a, b) => a.t > b.t)
    this.store()
    this.host.requestUpdate()
    return isVerified
  }

	async sendMessage(messageText, contact, store) {
		messageText = messageText.trim()
    if (messageText.length < 1) {
      return
    }
    contact = contact || this.host.contact.selected
    if (!contact || !contact.keys) {
      return
    }
    const toPubKeyHash = this.host.contact.selected.keys.auth.publicKeyHash
    const myKeys = this.host.pref.keys
    let prevHash = undefined
    for (let i = this.list.length-1; i >= 0; i--) {
      const m = this.list[i]
      if (m.f === toPubKeyHash || m.f === myKeys.auth.publicKeyHash && m.to === toPubKeyHash) {
        prevHash = m.h
        break
      }
    }
    const message = await buildMessage(myKeys.auth.keyPair.privateKey, myKeys.dh.keyPair.privateKey, messageText, myKeys.auth.publicKeyHash, contact.keys.dh.base64, prevHash)
    await sendMessage(contact.origin, contact.keys.auth.publicKeyHash, message)
    message.mP = messageText
    message.to = contact.keys.auth.publicKeyHash
    if (store) {
      this.list.push(message)
      this.store()
    }
    this.host.requestUpdate()
	}

  pushAll() {
    this.list.forEach(m => {
      let mCleaned = {...m};
      Object.assign(mCleaned, {mP: undefined})
      try {
        this.host.websocket.socket.send(JSON.stringify(mCleaned))
      } catch (e) {
        console.log("Failed to push messages")
      }
    })
  }
}



