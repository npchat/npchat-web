# npchat
## A simple & secure messaging protocol
This is simply a transport protocol, encryption & verification of data is the responsiblity of each client implementation.

This protocol does, however, specify standards that clients should follow for interoperability.

A client generates or imports an ECDSA P-384 key pair.
The hash of the public key is the address & id, called `authPubKeyHash`.

A client can send messages for any `authPubKeyHash` at any host that implements this protocol.

A client can authenticate with any host to fetch messages by signing the host's current challenge for the given `authPubKeyHash`.

## Channel
As implemented here, a Channel is a [Durable Object](https://developers.cloudflare.com/workers/learning/using-durable-objects).

It can in fact be a simple JSON object that holds state for a given `authPubKeyHash` (the users public id).

The state must contain:
- challenge, a JSON object
- messages, an array of messages not yet fetched

Everything else is derived from the request.

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
#### authPub & authPriv
The CryptoKeyPair containing `authPub` & `authPriv` CryptoKeys.

#### authPubJwk & authPrivJwk
The public & private signing KeyPair represented as JWK. The algorithm used is:
```JSON
{
	"name": "ECDSA",
	"namedCurve": "P-384"
}
```

#### authPubKeyHash
A public address, used as the root ID for each Channel. It is derived by hashing the `authPubJwk` (public signing key) using `SHA-256`.
```JS
const jwkHash = await crypto.subtle.digest("SHA-256", jwkBytes)
```

## Authentication
Fetching messages for the given `authPubKeyHash` requires authentication.

### 1. Request challenge
First, you need the current challenge. Make a request such as:
```JS
const challengeJson = await fetch(`${contact.host}/${contact.authPubKeyHash}/challenge`)
```
It will return something like
```JSON
{
	"t": 1633623658420,
	"exp": 1633624258420,
	"txt": "718d6400-e992-41e3-821a-50e69a89688f"
}
```
You should store it locally & check it's expiry date before requesting again.

### 2. Sign Challenge
Use `authPriv` to sign the challenge text.
```JS
const challengeBytes = new TextEncoder().encode(challenge.txt)
const signedChallenge = await crypto.subtle.sign(sigAlgorithm, authPriv, challengeBytes)
const signedChallengeBase58 = base58().encode(new Uint8Array(signedChallenge))

```


## The client
### Authentication
- check for stored challenge
	- if found & not expired, return it
	- if not found or expired, request a new one using `GET {host}/{authPubKeyHash}/challenge`
- sign challenge using privateKey
- perform authenticated request by setting in header: oc-pk (publicKey) & oc-sig (signedChallenge)

### Message encryption suggestion
This is just a suggestion for a message encryption implementation.

A client should import the public encryption (not signing) key of the recipient, and derive the shared secred using the senders private encryption key. A symmetrical algorithm such as AES-GCM 256 can be used to encrypt the message with the shared secred. This can be done using elliptic-curves with ECDH (Elliptic-Curve Diffie-Hellman).

### Contact import suggestion
Import as base58 text or QR code. The data should decode to a JSON object:
```JSON
{
	"host": "https://any.host",
	"authPubKeyHash": "{authPubKeyHash}",
	"authPubJwk": "{authPubJwk}",
	"encPubJwk": "{encPubJwk}"
}
```

## Next in pipeline
### Webclient
- LocalStorage data import & export (messages, contacts, preferences, keys)
- PWA push notification using service worker & a new Cloudflare worker
- end-to-end encrypted messages using ECDH & AES-GCM 256
- end-to-end encrypted voice & video calls using WebRTC, ECDH & AES-GCM 256

### Protocol
- WebSocket connection between client & a contact's Channel

### Not sure
Not sure whether to do this in protocol or client only...
#### send images & videos
There are two options:
- Client uploads to a serverless media-store (KV), and sends a link.
		This approach allows the protocol to remain as simple as possible, without adding complexity to the client either
- Implement this in the protocol


## Underlying goal
Maintain proper separation of concerns & absolute minimalism.
Add value, not features.