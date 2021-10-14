export function buildShareable(name, sigJwk, inboxDomain) {
	return {
		contact: {
			name: name,
			keys: {
				sig: {
					jwk: sigJwk,
				}
			},
			inboxDomain: inboxDomain
		}
	}
}