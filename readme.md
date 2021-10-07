# openchat
## A simple & secure messaging protocol
This is simply a transport protocol, encryption & verification of data is the responsiblity of each client implementation.

This protocol does, however, specify standards that clients should follow for interoperability.

A client can send messages for any pubKeyHash at any host that implements this protocol.
A client can authenticate with any host to fetch messages by siging the host's current challenge for the given pubKeyHash.

## Channel
As implemented here, a Channel is a [Durable Object](https://developers.cloudflare.com/workers/learning/using-durable-objects).

It can in fact be a simple JSON object that stores state for a given `sigPubJwkHash` (the users public id).

The state must contain:
- challenge, a JSON object with `{t: timestamp, exp: expiryTime, txt: challengeText}`
- messages, an array of messages not yet fetched

Everything else can be derived from or given by the request.

## Keys
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


### Types
#### sigPubJwkHash
This is used as the root ID for each Channel

## The client
### Authentication
- check for stored challenge
	- if found & not expired, return it
	- if not found or expired, request a new one using `GET {host}/{pubKeyHash}/challenge`
- sign challenge using privateKey
- perform authenticated request by setting in header: oc-pk (publicKey) & oc-sig (signedChallenge)

### Message encryption suggestion
This is just a suggestion for a message encryption implementation.

A client should import the public encryption (not signing) key of the recipient, and derive the shared secred using the senders private encryption key. A symmetrical algorithm such as AES-GCM 256 can be used to encrypt the message with the shared secred. This can be done using elliptic-curves with ECDH (Elliptic-Curve Diffie-Hellman).

### Contact import suggestion
Import as base58 text or QR code. The data should decode to a JSON object:
``` JSON
{
	"host": "https://any.host",
	"sigJwkHash": "{pubSigningJwkHash}",
	"sigJwk": "{pubSigningJwk}",
	"encJwk": "{pubEncryptionJwk}"
}
```

`host` & `sigJwkHash` are required. `sigJwkHash` is the hash of the publicSigningJwk.
`pubSigningJwk` and `pubEncryptionKey` are optional.
If `sigJwk` is omitted, a message signature cannot be verified
If `encJwk` is omitted, a shared secret cannot be derived, and so a message cannot be encrypted without another key echange mechanism.
