# openchat
A simple protocol for sending & recieving end-to-end asymetrically encrypted messages.
A client can send messages for any pubKeyHash at any host that implements this protocol.
A client can authenticate with any host to fetch messages.

The authentication process:
- check for stored challenge
	- if found & not expired, return it
	- if not found or expired, request a new one using `GET {host}/{pubKeyHash}/challenge`
- sign challenge using privateKey
- perform authenticated request by setting in header: oc-pk (publicKey) & oc-sig (signedChallenge)
