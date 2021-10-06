# openchat
A simple protocol for sending & recieving end-to-end asymetrically encrypted messages.
A client can send messages to any host that implements this protocol.
A client can authenticate with any host to fetch messages.

The authentication process:
- request challenge from host, giving my publicKeyHash (oc-pkh) in header
- sign challenge using privateKey
- perform authenticated request by setting in header publicKeyHash, publicKey (oc-pk) & signedChallenge (oc-sig))
