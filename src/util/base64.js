/**
 * Convert a base64 string to a Uint8Array
 * @param {String} base64String
 * @returns {Uint8Array}
 */
export function fromBase64(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

/**
 * Convert a Uint8Array to a String
 * @param {Uint8Array} uint8Array
 * @returns {String}
 */
export function toBase64(uint8Array) {
  return btoa(String.fromCharCode.apply(null, uint8Array))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}
