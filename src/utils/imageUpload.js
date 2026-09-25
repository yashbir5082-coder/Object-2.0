/**
 * Compresses and resizes an image file for URL-friendly storage.
 * @param {File} file - Image file from input
 * @param {number} maxWidth - Max width in pixels (default 600)
 * @param {number} quality - JPEG quality 0–1 (default 0.7)
 * @returns {Promise<string>} Base64 data URL of compressed image
 */
export function compressImage(file, maxWidth = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to ImgBB (free hosting).
 * Returns the hosted URL.
 * @param {string} base64Data - Base64 encoded image (without data URL prefix)
 * @returns {Promise<string|null>} Hosted image URL or null
 */
export async function uploadToImgBB(base64Data) {
  // ImgBB free API key (public, limited to 100 uploads/hour)
  const API_KEY = '9d2b1e7c8f4a3b5d6e7f8a9b0c1d2e3f'; // placeholder — user should get their own
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  try {
    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('image', cleanBase64);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    }
    return null;
  } catch (error) {
    console.error('ImgBB upload failed:', error);
    return null;
  }
}

/**
 * Reads a file from input and returns its base64 data URL.
 * @param {File} file - File from input
 * @returns {Promise<string>} Base64 data URL
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
