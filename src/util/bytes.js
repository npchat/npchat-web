/**
 * Compare Uint8Arrays for equality
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns
 */
export function isEqual(a, b) {
  if (
    a.constructor.name !== "Uint8Array" ||
    b.constructor.name !== "Uint8Array"
  ) {
    return undefined
  }
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
