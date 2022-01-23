const byteToHex = [];

for (let n = 0; n <= 0xff; ++n) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

/**
 * Convert Uint8Array to hex string
 * @param {Uint8Array} bytes 
 * @returns {String}
 */
export function toHex(bytes)
{
    const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

    for (let i = 0; i < bytes.length; ++i)
        hexOctets.push(byteToHex[bytes[i]]);

    return hexOctets.join("");
}

/**
 * Convert hex string to Uint8Array
 * @param {String} hexString 
 * @returns {Uint8Array}
 */
export function fromHex(hexString) {
	const values = hexString
			.match(/.{1,2}/g)
			.map(byte => parseInt(byte, 16))
  return new Uint8Array(values);
}