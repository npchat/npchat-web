export function buildShareable(name, sigJwk, inboxDomain) {
	return {
		shareable: {
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