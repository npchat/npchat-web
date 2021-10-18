# npchat
## A simple & secure messaging protocol
This is an application-layer protocol for secure messaging across hosts.

A message is sent to any contact on any host using their `authPublicKeyHash` as an ID.

A client connects to their host by requesting a WebSocket upgrade.
After a successful handshake, the client will receive all messages sent to them immediately.
If a reciepient is offline, their messages are stored on the host until collected after the next successful handshake.

## Channel
A `Channel` is an inbox on a host for a single `authPublicKeyHash`.
It facilitates one-way communication from any sender to the owner of the keys corresponding to the given `authPublicKeyHash`

As implemented here, a Channel is a [Durable Object](https://developers.cloudflare.com/workers/learning/using-durable-objects).

The host's state for any given `authPublicKeyHash` must contain:
- all messages not yet collected
- authenticated WebSocket connections

Notice that no keys are ever stored on the host.

### 1. Request WebSocket upgrade
```JS
const webSocket = new WebSocket(`wss://${domain}/${publicKeyHash}`)
```

### 2. Handshake
The purpose of this handshake is to authenticate a request for a websocket session.

#### 2.1 Authentication
1. Client requests a challenge
```JS
// webclient/src/component/app.js  async connectWebSocket()
webSocket.addEventListener("open", () => {
	webSocket.send(JSON.stringify({get: "challenge"}))
})
```
2. Server responds with
```JSON
{
	"exp" : 1634413304391,
	"challenge" : "4uhc5DdN3xethCiZsyvU6aRbYj1asgP8YFPYcoLBum8F"
	}
```
This implementation hashes with SHA-256 a randomUUID salted with the current timecode. Challenges should expire within minutes. A new one is generated for each handshake.
```JS
async makeChallenge() {
	// Date.now() is only used to salt the UUID
	const randomString = crypto.randomUUID()+Date.now()
	const challengeHash = await hash(new TextEncoder().encode(randomString))
	return {
		exp: Date.now()+this.challengeTtl,
		txt: base58().encode(new Uint8Array(challengeHash))
	}
}
```

3. Client signs challenge with their ECDSA P-256 private key
```JS
const authAlgorithm = {
	name: "ECDSA",
	hash: "SHA-256"
}
export async function sign(privCryptoKey, bytes) {
	return crypto.subtle.sign(authAlgorithm, privCryptoKey, bytes)
}
```

#### 2.2 Post-authentication
- the host pushes all stored messages to the client, and removes them from storage
- any incomming messages are pushed immediately to the client




### Message format

### Contact format

## Keys
A client must generate a ECDSA P-384 key pair.

The private key is used to authenticate by signing a random challenge.

The public key is used to verify the signed challenge.

The hash of the public key `authPubKeyHash` is used as a public address and Channel Id.

### Algorithm
The signing keys are an ECDSA P-385 key pair. The signing algorithm is ECDSA SHA-384. These are shown in the following example.
```JS
const authKeyParams = {
				name: "ECDSA",
				namedCurve: "P-256"
			}
			
const authAlgorithm = {
	name: "ECDSA",
	hash: "SHA-256"
}
```

### Format
A CryptoKey is exported & imported as a JWK (JSON Web Key).
For easy transmission, they are encoded as base58 strings.

### Encoding & decoding
Encode between base58 string & JWK JSON object.

#### Encoding
```JS
// return a base58 string from JWK JSON object
encodeJwk = jwk => {
	// make sure you stringify the JWK, or you will encode "[object Object]"
	const jwkBytes = new TextEncoder().encode(JSON.stringify(jwk))
	// use a base58 encoding/decoding helper
	return base58().encode(jwkBytes)
}
```

#### Decoding
```JS
// return a JWK JSON object from base58 string
decodeJwk = base58Str => {
	// decode base58 string to bytes
	const jwkBytes = base58().decode(base58Str)
	// decode bytes to string & return parsed JSON
	return JSON.parse(new TextDecoder().decode(jwkBytes))
}
```

### Importing & exporting
Keys are exported as JWK because it's easy to stringify & encode them, and it's easy to do the reverse.
They are imported as a CryptoKey.

#### Import
A JWK is imported as a CryptoKey.
```JS
const authKeyParams = {
	name: "ECDSA",
	namedCurve: "P-384"
}
const cryptoKey = await crypto.subtle.importKey("jwk", jwk, authKeyParams)
```

#### Export
A CryptoKey is exported as a JWK.
```JS
const jwk = await crypto.subtle.exportKey("jwk", cryptoKey)
```


### Types
#### ECDSA P-256 for Auth
The CryptoKeyPair used to sign & verify messages & authenticate with a server.
```JSON
{
	"name": "ECDSA",
	"namedCurve": "P-256"
}
```

#### ECDH P-256 Diffie-Hellman for encryption
A shared secret is derived after exchanging public keys. This shared secret is used to encrypt each message with a unique random IV.
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
### Webclient
- end-to-end encrypted voice & video calls using WebRTC

### Server

### Not sure
Not sure whether to do this in protocol or client only...
#### send images & videos
There are two options:
- Client uploads to a serverless media-store (KV), and sends a link.
		This approach allows the protocol to remain as simple as possible, without adding complexity to the client either
- Implement this in the protocol