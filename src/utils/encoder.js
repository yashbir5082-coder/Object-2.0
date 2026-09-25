import LZString from 'lz-string';

/**
 * Compresses a JavaScript object into a URL-safe string.
 * Uses LZ-String compression + Base64 encoding.
 */
export function encodeGiftData(data) {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
  } catch (error) {
    console.error('Failed to encode gift data:', error);
    return null;
  }
}

/**
 * Decompresses a URL-safe string back into a JavaScript object.
 */
export function decodeGiftData(encodedString) {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(encodedString);
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode gift data:', error);
    return null;
  }
}

/**
 * Generates a full shareable URL with encoded gift data.
 */
export function generateShareableLink(data) {
  const encoded = encodeGiftData(data);
  if (!encoded) return null;
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/gift/${encoded}`;
}

/**
 * Extracts gift data from a URL hash.
 */
export function extractDataFromHash(hash) {
  const match = hash.match(/#\/gift\/(.+)/);
  if (!match) return null;
  return decodeGiftData(match[1]);
}
