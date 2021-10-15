import { importKey } from "../../../util/key";
import { sendMessage, messagesKey, buildMessage, verifyMessage } from "../../../util/message"

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
      console.log("failed to parse stored messages")
      this.list = []
    }
  }

	async handleReceivedMessage(data, doStore) {
    if (data.m && data.f && data.h) {
      const exists = this.list.find(m => m.h === data.h)
      if (exists) {
        return false
      }
      let isVerified = false
      const contactMatch = this.host.contact.list.find(c => c.keys.sig.publicHash === data.f)
      // we need a contactMatch to get the public key, & the message must contain a hash & sig
      if (contactMatch && data.h && data.s) {
        const contactSigPub = await importKey(contactMatch.keys.sig.jwk, ["verify"])
        isVerified = await verifyMessage(contactSigPub, data)
      } else {
        console.log("no match, hash or sig", data)
      }
      if (isVerified) {
        const storable = data
        storable.v = isVerified
        this.list.push(storable)
        if (doStore) {
          this.store()
        }
        this.host.requestUpdate()
      } else {
        console.log("rejected unverified message", data)
      }
      return isVerified
    }
    return false
  }

	async handleSendMessage(inboxDomain, publicHash, message) {
		message = message.trim()
    if (message.length < 1) {
      return
    }
    const res = await sendMessage(inboxDomain, this.host.pref.keys.sig.keyPair.privateKey, message, this.host.pref.keys.sig.publicHash, publicHash)
    if (res.error) {
      console.log("error", res)
      return
    }
    // build a local version for storage
    const sentMessage = await buildMessage(undefined, message, this.host.pref.keys.sig.publicHash)
    Object.assign(sentMessage, {to: publicHash, v: true})
    this.list.push(sentMessage)
    this.store()
    this.host.requestUpdate()
	}

  pushAll() {
    const ws = this.host.webSocket
    this.list.forEach(m => ws.send(JSON.stringify(m)))
  }
}



