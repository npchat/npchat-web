import { LitElement, html } from "lit"
import { pack } from "msgpackr"
import { importAuthKey, importDHKey } from "../../core/keys.js"
import { buildMessage } from "../../core/message.js"
import { iceConfig } from "../../core/webrtc.js"
import { formStyles } from "../../styles/form.js"
import { generalStyles } from "../../styles/general.js"
import { fromBase64 } from "../../util/base64.js"
import { callStyles } from "./styles.js"

export class Call extends LitElement {
  static get properties() {
    return {
      inCall: { type: Boolean },
      contact: { type: Object },
      videoEnabled: { type: Boolean },
    }
  }

  static get styles() {
    return [formStyles, generalStyles, callStyles]
  }

  get localView() {
    return this.renderRoot.getElementById("local-video")
  }

  get remoteView() {
    return this.renderRoot.getElementById("remote-video")
  }

  constructor() {
    super()
    this.videoEnabled = true

    window.addEventListener("packedMessageReceived", async event => {
      if (!this.theirKeys) {
        this.contact = event.detail.contact
        await this.initKeys()
      }

      try {
        const msg = JSON.parse(event.detail.unpacked)
        const { offer, answer, candidate, call } = msg
        if (offer) {
          this.initPeerConnection()
          await this.startLocalStream({ width: 300, height: 300 })
          await this.pc.setRemoteDescription(new RTCSessionDescription(offer))
          await this.pc.setLocalDescription(await this.pc.createAnswer())
          await this.sendData({ answer: this.pc.localDescription })
        } else if (answer) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(answer))
        } else if (candidate) {
          try {
            await this.pc.addIceCandidate(candidate)
          } catch (err) {
            // console.log("failed adding ICE candidate", err)
          }
        } else if (call === "end") {
          await this.endCall(false)
        }
      } catch (err) {
        console.log("failed to parse packed message as JSON", err)
      }
    })
  }

  render() {
    return html`
      <div ?hidden=${!this.inCall}>
        <div class="call">
          <h1>${this.contact?.displayName}</h1>
          <video
            id="local-video"
            class="local"
            ?hidden=${!this.videoEnabled}
            playsinline
            autoplay
            muted
          ></video>
          <img
            alt="avatar"
            src=${this.contact?.avatarURL}
            ?hidden=${this.videoEnabled || !this.contact?.avatarURL}
            class="avatar"
          />
          <video id="remote-video" class="remote" playsinline autoplay></video>
          <div class="buttonGroup">
            <button class="icon endCall" @click=${() => this.endCall(true)}>
              <img alt="end call" src="assets/icons/end_call.svg" />
            </button>
          </div>
        </div>
      </div>
    `
  }

  async startLocalStream(videoOptions) {
    const videoConstraints = {
      facingMode: "user",
      width: { ideal: videoOptions?.width },
      height: { ideal: videoOptions?.height },
    }
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true },
      video: videoOptions ? videoConstraints : false,
    })
    for (const track of this.localStream.getTracks()) {
      this.pc.addTrack(track, this.localStream)
    }
    if (videoOptions) {
      this.localView.srcObject = this.localStream
      this.localView.play()
    }
  }

  async startCall(event) {
    Object.assign(this, event.detail)
    await this.initKeys()
    this.initPeerConnection()
    await this.startLocalStream({ width: 300, height: 300 })
    await this.pc.setLocalDescription(await this.pc.createOffer())
    await this.sendData({ offer: this.pc.localDescription })
  }

  async endCall(notifyPeer) {
    this.inCall = false
    if (notifyPeer) {
      await this.sendData({ call: "end" })
    }
    this.theirKeys = null
    this.remoteView.srcObject = null
    this.localView.srcObject = null
    this.pc.close()
    this.localStream?.getTracks().forEach(t => t.stop())

    this.dispatchEvent(
      new CustomEvent("callEnded", {
        composed: true,
        bubbles: true,
      })
    )
    console.log("call ended")
  }

  initPeerConnection() {
    this.inCall = true
    this.pc = new RTCPeerConnection(iceConfig)

    // listen for remote stream
    this.pc.ontrack = ({ track }) => {
      track.onunmute = () => {
        if (!this.remoteView.srcObject) {
          this.remoteView.srcObject = new MediaStream()
        }
        this.remoteView.srcObject.addTrack(track)
      }
    }

    // listen for ICE candidates & send them to peer
    this.pc.onicecandidate = ({ candidate }) => {
      this.sendData({ candidate })
    }

    // listen for connection state changes
    this.pc.onconnectionstatechange = () => {
      const pcs = this.pc.connectionState
      if (pcs === "connected") {
        console.log("PEERS CONNECTED")
      } else if (pcs === "disconnected" || pcs === "failed") {
        this.endCall(false)
      }
    }
  }

  async sendData(data) {
    const msg = await buildMessage(
      this.myKeys.auth.keyPair.privateKey,
      this.myKeys.dh.keyPair.privateKey,
      pack(JSON.stringify(data)),
      this.myPubKeyHashBytes,
      this.peerKeys.dh
    )
    const url = `${this.contact.originURL}/${this.contact.keys.pubKeyHash}?store=false`
    return fetch(url, {
      method: "POST",
      body: pack(msg),
    })
  }

  async initKeys() {
    this.myPubKeyHashBytes = fromBase64(this.myKeys.pubKeyHash)
    this.peerKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, ["verify"]),
      dh: await importDHKey("jwk", this.contact.keys.dh, []),
    }
  }
}
