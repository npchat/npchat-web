export function buildShareable(name, domain, authBase64, dhBase64) {
	return {
		contact: {
			name: name,
			domain: domain,
			keys: {
				auth: {
					base64: authBase64,
				},
				dh: {
					base64: dhBase64
				}
			}
		}
	}
}