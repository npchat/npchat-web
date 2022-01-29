import { LitElement, html, css } from "lit"
import { pack } from "msgpackr"
import { importAuthKey, importDHKey } from "../core/keys.js"
import { buildMessage } from "../core/message.js"
import { getMediaStream, iceConfig } from "../core/webrtc.js"
import { formStyles } from "../styles/form.js"
import { generalStyles } from "../styles/general.js"
import { fromBase64 } from "../util/base64.js"

export class Call extends LitElement {
  static get properties() {
    return {
      inCall: { type: Boolean },
      contact: { type: Object },
      audioEnabled: { type: Boolean },
      videoEnabled: { type: Boolean }
    }
  }

  static get styles() {
    return [
      formStyles,
      generalStyles,
      css`
        .call {
          width: 100vw;
          height: 100vh;
          height: -webkit-fill-available;
          position: fixed;
          top: 0;
          left: 0;
          background-color: var(--color-darkgrey);
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--color-offwhite)
        }

        button.endCall {
          background-color: var(--color-red)
        }

        video {
          max-width: 100%;
          flex-grow: 1;
        }

        video.local {
          max-height: 20vh;
        }

        video.remote {
          max-height: 60vh;
        }
      `,
    ]
  }

  get localVideoElement() {
    return this.renderRoot.getElementById("local-video")
  }

  get remoteVideoElement() {
    return this.renderRoot.getElementById("remote-video")
  }

  constructor() {
    super()
    window.addEventListener("packedMessageReceived", async event => {
      try {
        const msg = JSON.parse(event.detail.unpacked)

        if (msg.offer && !this.inCall) {
          this.localStream = await getMediaStream()
          this.setVideoStream(this.localVideoElement, this.localStream)
          
          console.log("creating RTCPeerConnection")
          this.inCall = true
          this.peerConnection = new RTCPeerConnection(iceConfig)
          this.setupCall()

          this.contact = event.detail.contact
          await this.initKeys()
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.offer))
          const answer = await this.peerConnection.createAnswer()
          await this.peerConnection.setLocalDescription(answer)
          await this.sendData({ answer })

          // send stored ICE candidates
          await Promise.allSettled((this.iceCandidates || [])
            .map(c => this.sendData({ iceCandidate: c })))
          this.iceCandidates = []
          return
        }

        if (msg.answer) {
          const remoteDesc = new RTCSessionDescription(msg.answer)
          await this.peerConnection.setRemoteDescription(remoteDesc)
          return
        }

        if (msg.iceCandidate) {
          try {
            await this.peerConnection.addIceCandidate(msg.iceCandidate)
          } catch (e) {
            this.iceCandidates = this.iceCandidates || []
            this.iceCandidates.push(msg.iceCandidate)
          }
          return
        }

        if (msg.call === "end") {
          await this.endCall(false)
        }

      } catch (error) {
        console.log("failed to parse packed message as JSON", error)
      }
    })
  }
  
  render() {
    return html`
    <div ?hidden=${!this.inCall}>
      <div class="call">
        <h1>${this.contact?.displayName}</h1>
        <video id="local-video" class="local" ?hidden=${!this.videoEnabled} playsinline autoplay></video>
        <video id="remote-video" class="remote" ?hidden=${!this.videoEnabled} playsinline autoplay></video>
        <button class="icon endCall" @click=${() => this.endCall(true)}>
          <img alt="end call" src="assets/icons/end_call.svg" />
        </button>
      </div>
    </div>
    `
  }

  async sendData(data) {
    const msg = await buildMessage(
      this.myKeys.auth.keyPair.privateKey,
      this.myKeys.dh.keyPair.privateKey,
      pack(JSON.stringify(data)),
      this.myPubKeyHashBytes,
      this.theirKeys.dh
    )
    // set query param store=false
    const url = `${this.contact.originURL}/${this.contact.keys.pubKeyHash}?store=false`
    return fetch(url, {
      method: "POST",
      body: pack(msg)
    })
  }

  async initKeys() {
    this.myPubKeyHashBytes = fromBase64(this.myKeys.pubKeyHash)
    this.theirKeys = {
      auth: await importAuthKey("jwk", this.contact.keys.auth, [
        "verify",
      ]),
      dh: await importDHKey("jwk", this.contact.keys.dh, []),
    }
  }

  setupCall() {
    // add local stream to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream)
    })

    // listen for ICE candidates & send them to peer
    this.peerConnection.addEventListener("icecandidate", event => {
      if (event.candidate) {
        this.sendData({iceCandidate: event.candidate})
      }
    })

    // listen for connection state changes
    this.peerConnection.addEventListener("connectionstatechange", () => {
      const pcs = this.peerConnection.connectionState
      if (pcs === "connected") {
        console.log("PEERS CONNECTED")
        this.update()
      } else if (pcs === "disconnected" || pcs === "failed") {
        this.endCall(false)
      }
    })

    // listen for remote stream
    this.peerConnection.addEventListener("track", event => {
      if (this.remoteStream !== event.streams[0]) {
        this.remoteStream = event.streams[0]
        this.setVideoStream(this.remoteVideoElement, this.remoteStream)
      }
    })
  }

  setVideoStream(videoElement, stream) {
    //if (this.videoEnabled) {
      videoElement.srcObject = stream
      videoElement.play()
    //}
  }

  async startCall(e) {
    this.inCall = true;
    Object.assign(this, e.detail)
    await this.initKeys()
    this.localStream = await getMediaStream()
    this.setVideoStream(this.localVideoElement, this.localStream)

    this.peerConnection = new RTCPeerConnection(iceConfig);
    this.setupCall()

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: this.videoEnabled
    })
    await this.peerConnection.setLocalDescription(offer)
    await this.sendData({ offer })
  }

  async endCall(notifyPeer) {
    this.inCall = false

    if (notifyPeer) {
      await this.sendData({ call: "end" })
    }

    this.peerConnection?.close()
    this.peerConnection = null
    this.localStream?.getTracks().forEach(t => t.stop())
    this.remoteStream?.getTracks().forEach(t => t.stop())
    this.dispatchEvent(new CustomEvent("callEnded", {
      composed: true,
      bubbles: true
    }))
    console.log("call ended")
  }
}
