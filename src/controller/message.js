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
    await this.checkMissing()
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

    const plain = new TextDecoder().decode(messagePlainBytes)

    const contact = this.host.contact.list.find(c => c.keys.auth.publicKeyHash === data.f)
    
    try {
      const parsed = JSON.parse(plain)
      if (parsed.resend) { // resend the requested message
        const msg = {}
        Object.assign(msg, this.list.find(m => m.h === parsed.resend), {mP: undefined, to: undefined})
        await sendMessage(contact.origin, contact.keys.auth.publicKeyHash, msg)
        console.log("resent message", msg)
      }
    } catch (e) {
      const storable = data
      storable.mP = plain
      this.list.push(storable)
      this.list = this.list.sort((a, b) => a.t > b.t)
      if (doStore) {
        this.store()
      }
      this.host.requestUpdate()
      this.checkMissing(contact)
    }
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

  async checkMissing(contact) {
    const msgs = this.list.filter(m => m.f === contact.keys.auth.publicKeyHash || m.to === contact.keys.auth.publicKeyHash)
    for (let i = msgs.length-1; i > 0; i--) {
      const cur = msgs[i]
      const prev = msgs[i-1]
      if (cur.p !== prev.h) {
        // something wrong
        console.log("something wrong")
        const p = this.list.find(m => m.h === cur.p)
        if (p) {
          // find message pointing to p
          const toResend = this.list.find(m => m.p === p.h)
          console.log("contact is missing a message", toResend)
          const cleaned = {}
          Object.assign(cleaned, toResend, {to: undefined, mP: undefined})
          await sendMessage(contact.origin, contact.keys.auth.publicKeyHash, cleaned)
          console.log("resent", toResend)
        } else {
          const resendMsg = JSON.stringify({resend: cur.p})
          await this.sendMessage(resendMsg, contact)
        }
      }
    }
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



