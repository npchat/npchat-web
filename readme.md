# openchat
## A simple & secure messaging protocol
This is simply a transport protocol, encryption & verification of data is the responsiblity of each client implementation.

This protocol does, however, specify standards that clients should follow for interoperability.

A client can send messages for any pubKeyHash at any host that implements this protocol.
A client can authenticate with any host to fetch messages by siging the host's current challenge for the given pubKeyHash.

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
	"pkh": pubKeyHash,
	"pubSigningKey": pubSigningKey, // optional, needed to verify message content & sender
	"pubEncryptionKey": pubEncryptionKey // optional, needed to derive the shared secret for message encryption
}
```
