export function base64UrlToUint8Array(base64String) {
	var padding = '='.repeat((4 - base64String.length % 4) % 4);
	var base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

	var rawData = atob(base64);
	var outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i)  {
			outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

export function uint8ArrayToBase64Url(uint8Array, start, end) {
  start = start || 0;
  end = end || uint8Array.byteLength;

  const base64 = btoa(
    String.fromCharCode.apply(null, Array.from(uint8Array.subarray(start, end)))
  );
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}