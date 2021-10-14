export function buildShareable(name, sigJwk, inboxDomain) {
	return {
		name: name,
		keys: {
			sig: {
				jwk: sigJwk,
			}
		},
		inboxDomain: inboxDomain
	}
}