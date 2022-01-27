export function buildShareable(name, origin, authBase64, dhBase64) {
	return {
		contact: {
			name: name,
			origin: origin,
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