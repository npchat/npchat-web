# npchat
## 1. A simple & secure host agnostic messaging protocol
This is an application-layer protocol for secure messaging across hosts.

It uses Elliptic Curve cryptography for signing, verifying, encrypting & decrypting messages end-to-end.

A message is sent to any contact on any host using their `authPublicKeyHash` as an ID.

A client connects to their host by requesting a WebSocket upgrade.
After a successful handshake, the client will receive all messages sent to them immediately.
If a reciepient is offline:
- their messages are stored on the host until collected after the next successful handshake
- they will recieve a Web-Push notification if subscribed

## 2. Channel
A `Channel` is an inbox on a host for a single `authPublicKeyHash`.
It facilitates one-way communication from any sender to the owner of the private keys corresponding to the given `authPublicKeyHash`

The Channel's state for any given `authPublicKeyHash` must contain:
- all messages not yet collected
- Web-Push subscriptions

No Client keys are ever stored on the host.

### 2.1 Request WebSocket upgrade
```JS
const webSocket = new WebSocket(`wss://${domain}/${authPublicKeyHash}`)
```

### 2.2 Handshake
The purpose of this handshake is to authenticate a request for a websocket session.

#### 2.2.1 Client requests a challenge
```JS
// webclient/src/component/app.js  async connectWebSocket()
webSocket.addEventListener("open", () => {
	webSocket.send(JSON.stringify({get: "challenge"}))
})
```
#### 2.1.2 Server responds with a random signed challenge
```JSON
{
	"challenge" : {
		"txt": "SgkXcdCgLeqZhc13EhApGmsUKC1qrLd3OBYx6GznVAU",
		"sig":"t8ALom4wqABOl2x5wun8k3ShWm3qS8HNPfzPXi_A6ejTy9f7-QifJ6FxgE9lA4bssvWkdBC9OG_sQKuA0rOfww"
	}
}
```
This implementation hashes with `SHA-256` a randomUUID salted with the current timecode.
```JS
// worker/src/index.mjs
async makeChallenge() {
	// timecode is only used to salt the UUID
	const randomBytes = new TextEncoder().encode(crypto.randomUUID()+Date.now())
	const challenge = new Uint8Array(await hash(randomBytes))
	const signature = new Uint8Array(await sign(this.authKeyPair.privateKey, challenge))
	return {
		txt: bytesToBase64(challenge),
		sig: bytesToBase64(signature)
	}
}
```

#### 2.1.3 Client signs challenge with ECDSA P-256 private key
Client signs the challenge text using their private auth key.
Then they return the solution along with the challenge & public key.
```JS
// webclient/src/controller/websocket  async handleMessage(event, resolve)
if (data.challenge) {
	const solution = await sign(pref.keys.auth.keyPair.privateKey, base64ToBytes(data.challenge.txt))
	const challengeResponse = {
		publicKey: pref.keys.auth.base64.publicKey,
		challenge: data.challenge,
		solution: bytesToBase64(new Uint8Array(solution))
	}
	this.socket.send(JSON.stringify(challengeResponse))
	return
}
```

#### 2.1.4 If the signed challenge is accepted & verified by the Server

#### 2.2 Post-authentication
- Server pushes all stored messages to Client, and removes them from storage
- any incomming messages are pushed immediately to Client

## 3. Encoding & decoding
Bytes of keys, signatures & hashes are encoded as [base64url](https://www.rfc-editor.org/rfc/rfc4648#page-7) strings.

All messages are sent as JSON strings.

Keys are normally exported as raw bytes & base64 encoded.
There is one exception: exporting a ECDSA as raw is not possible, so JWK is used for this case.

## 4. Object types

### 4.1 Message
A message contains the following data.
```JSON
{
	"t":1634569493250, // time of message
	"iv":"nfIKqyhooM_XQLX9pVmLW_pzCfq9VclsxkRBsJ8Vwy4", // random (never reused) IV
	"m":"ZIGy0qpnQ-6baacSbHf_pEyQ1rw", // message encrypted with ECDH P-256 derived secret
	"f":"5qMMiqcHEvfTSuxH7HyQj1WprvMjzO95zZsbyRxW1dk", // from authPublicKeyHash
	"h":"Nx6wRwmEXxeugQLPSN6UnvOmmDitGYIeMjYJiEx6qyE", // message hash
	"s":"OYbL0kPZr-zwQQtf4IcrpVuSw0EXKcwlagk0br8JTyNZjwILDye7BMHqdvAuZy69xPrBZ2tQM4lTjyrpzToAKA" // signature
}
```
#### 4.1.1 Build message
```JS
// webclient/src/controller/message.js  async handleSendMessage(messageText)
const message = await buildMessage(myKeys.auth.keyPair.privateKey, myKeys.dh.keyPair.privateKey, messageText, myKeys.auth.publicKeyHash, contact.keys.dh.base64)

// webclient/src/util/message.js
export async function buildMessage(authPriv, dhPrivateKey, messageText, from, toDHBase64) {
	const t = Date.now()
	const iv = await getIV(from+t)
	const ivBytes = new Uint8Array(iv)
	const toDHRaw = base64ToBytes(toDHBase64)
	const dhPublicKey = await importDHKey("raw", toDHRaw, [])
	const derivedKey = await deriveDHSecret(dhPublicKey, dhPrivateKey)
	const encrypted = await encrypt(iv, derivedKey, new TextEncoder().encode(messageText))
	const encryptedBytes = new Uint8Array(encrypted)
	const associatedBytes = new TextEncoder().encode(JSON.stringify({t: t, f: from}))
	const bytesToHash = new Uint8Array([...ivBytes, ...encryptedBytes, ...associatedBytes])
	const messageHash = new Uint8Array(await hash(bytesToHash))
	const message = {
		t: t,
		iv: bytesToBase64(ivBytes),
		m: bytesToBase64(encryptedBytes),
		f: from,
		h: bytesToBase64(messageHash)
	}
	const hashSig = new Uint8Array(await sign(authPriv, messageHash))
	message.s = bytesToBase64(hashSig)
	return message
}
```

### 4.2 Contact
A contact contains the following data. The domain is where message POST requests will be sent.
The ECDSA P-256 auth key is used to verify signatures of messages received.
The ECDH P-256 dh key is used to derive a shared secret key that is used to encrypt & decrypt the messages.
```JSON
{
	"name": "HisDudeness",
	"domain": "chat.dudely.io",
		"keys": { // as base64url
			"auth": { // ECDSA P-256 public key
				"base64": "BLwvAqlP4EZv-gWhCgJt2ug48oxn09fG3A_MXv-aWoA2cDOCKE0SHS76xy2IIGEKVLdFrGm3wORFyZNRniGjpcg"
			},
			"dh": { // ECDH P-256 public key
				"base64": "BEujTt5niNJ0PIzNDb5fc0J4wDkutWVeOpLDF9_ROQ8FShjKc8X-pU0oZSW2fvsjx6xTP9ueHP6mqTyjYGcVhhs"
			}
		}
}
```

## 5. Keys
### 5.1 Auth
### 5.1.1 ES256 key pair
A Client & Server must generate & store an `ES256` key pair. This is [SHA-256 with ECDSA P-256](https://datatracker.ietf.org/doc/html/rfc7518#page-9).
This is used to sign & verify data between Clients & also to authenticate with a Server.
```JSON
{
	"name": "ECDSA",
	"namedCurve": "P-256"
}
```

### 5.1.2 SHA-256 Public key hash
A Client generates this by hashing the public key with SHA-256.
This value is referred to as `authPublicKeyHash`.
The `authPublicKeyHash` is used as a public ID.

### 5.2 ECDH P-256 key pair
A Client generates a SHA-256 with ECDH P-256 key pair. This is used to derive a shared secret with another Client.
```JS
const dhKeyParams = {
	name: "ECDH",
	namedCurve: "P-256"
}
const aesMode = "AES-GCM"
const aesKeyParams = {
	name: aesMode,
	length: 256
}
```

## Next in pipeline
### webclient
- End-to-end encrypted voice & video calls using WebRTC
- Better data import/export

### go-npchat
- Implement Web-Push
- Write messages to disk when buffer full
