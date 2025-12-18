/**
 * Utility functions for handling image data from API
 * Supports both base64 encoded images and URL-based images
 */

/**
 * Convert image data to a displayable URI
 * Handles both base64 encoded images and URL paths
 * @param imageData - The image data from API (could be base64 or URL path)
 * @param baseUrl - Optional base URL for relative paths (default: https://compassnetwork.runasp.net)
 * @returns A URI string that can be used with React Native Image component
 */
export const getImageUrl = (imageData: string, baseUrl: string = 'https://compassnetwork.runasp.net'): string => {
  if (!imageData) {
    return '';
  }

  // Check if it's already a base64 encoded image
  if (imageData.startsWith('data:image/')) {
    return imageData;
  }

  // Check if it's a base64 string without the data URI prefix
  if (isBase64(imageData)) {
    // Detect image type from base64 or default to jpeg
    const imageType = detectImageType(imageData);
    return `data:image/${imageType};base64,${imageData}`;
  }

  // Otherwise, treat it as a URL path and prepend base URL if needed
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  // Relative path - prepend base URL
  return `${baseUrl}${imageData}`;
};

/**
 * Check if a string is base64 encoded
 * @param str - String to check
 * @returns true if string appears to be base64 encoded
 */
const isBase64 = (str: string): boolean => {
  if (!str || str.length === 0) {
    return false;
  }

  try {
    // Base64 regex pattern
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str);
  } catch (error) {
    return false;
  }
};

/**
 * Detect image type from base64 string
 * @param base64String - Base64 encoded image string
 * @returns Image type (jpeg, png, gif, webp, etc.)
 */
const detectImageType = (base64String: string): string => {
  // Check first few bytes to determine image type
  const firstBytes = base64String.substring(0, 12);

  // PNG: iVBORw0KGgo=
  if (firstBytes.startsWith('iVBORw0KGgo')) {
    return 'png';
  }

  // JPEG: /9j/4AAQSkZJRg==
  if (firstBytes.startsWith('/9j/4AAQSkZJRg')) {
    return 'jpeg';
  }

  // GIF: R0lGODlhAQ==
  if (firstBytes.startsWith('R0lGODlh')) {
    return 'gif';
  }

  // WebP: UklGRiYAAABXRUJQ
  if (firstBytes.startsWith('UklGRiYAAABXRUJQ')) {
    return 'webp';
  }

  // Default to jpeg
  return 'jpeg';
};

/**
 * Convert base64 image to blob (useful for uploading)
 * @param base64String - Base64 encoded image string
 * @param mimeType - MIME type of the image (default: image/jpeg)
 * @returns Blob object
 */
export const base64ToBlob = (base64String: string, mimeType: string = 'image/jpeg'): Blob => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

