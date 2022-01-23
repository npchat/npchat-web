import "qrcode/build/qrcode.js"

export async function generateQR(text, options) {
  try {
    return await window.QRCode.toDataURL(text, options)
  } catch (err) {
    console.error(err)
  }
}