import QRCode from "qrcode/build/qrcode"

export async function generateQR(text, options) {
  try {
    return await QRCode.toDataURL(text, options)
  } catch (err) {
    console.error(err)
  }
}