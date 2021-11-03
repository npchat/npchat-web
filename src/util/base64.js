export function base64ToBytes(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/')
	const rawData = atob(base64);
	const output = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i)  {
		output[i] = rawData.charCodeAt(i)
	}
	return output
}

export function bytesToBase64(uint8Array, start, end) {
  start = start || 0
  end = end || uint8Array.byteLength
  const base64 = btoa(
    String.fromCharCode.apply(null, Array.from(uint8Array.subarray(start, end)))
  )
  return base64
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
}