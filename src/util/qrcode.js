export async function generateQR(text, options) {
  return window.QRCode.toDataURL(text, options)
}
