export function buildShareable(name, authJwk, dhJwk, domain) {
	return {
		contact: {
			name: name,
			keys: {
				auth: {
					jwk: authJwk,
				},
				dh: {
					jwk: dhJwk
				}
			},
			domain: domain
		}
	}
}