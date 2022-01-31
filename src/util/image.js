const mimeType = "image/jpeg"
const quality = 90

export function resizeImageFile(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = blobUrl;
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject('Failed to load image');
    };
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const srcSize = { width: img.width, height: img.height};
      const newSize = calculateSize(img, maxWidth, maxHeight);
      const canvas = document.createElement('canvas');
      canvas.width = newSize.width;
      canvas.height = newSize.height;
      const ctx = canvas.getContext('2d');

      const srcAspectRatio = srcSize.width / srcSize.height;
      const newAspectRatio = newSize.width / newSize.height;
      const deltaAspectRatio = srcAspectRatio - newAspectRatio;

      let sX, sY, sW, sH;
      if (deltaAspectRatio > 0) {
        // source is wider than target
        sX = deltaAspectRatio * srcSize.width / 2;
        sY = 0;
        sW = srcSize.height * newAspectRatio;
        sH = srcSize.height;
      } else {
        // source is narrower than target
        sX = 0;
        sY = -deltaAspectRatio * srcSize.height / 2;
        sW = srcSize.width;
        sH = srcSize.width * newAspectRatio;
      }

      ctx.drawImage(img, sX, sY, sW, sH, 0,0, newSize.width, newSize.height);

      canvas.toBlob(blob => resolve(blob), mimeType, quality)
    }
  })
}

/**
 * Calculate size based on given max dimensions
 * @param { HTMLImageElement } srcImg
 * @param { number } maxWidth
 * @param { number } maxHeight
 * @returns {{width: number, height: number}}
 */
function calculateSize(srcImg, maxWidth, maxHeight) {
  return {
    width: Math.min(...[srcImg.width, maxWidth]),
    height: Math.min(...[srcImg.height, maxHeight])
  }
}
