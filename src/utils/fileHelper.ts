// src/utils/fileHelpers.ts

/**
 * Detects file type from a URL, ignoring query parameters and fragments.
 * Returns 'image', 'pdf', or 'other'.
 */
export const detectFileType = (url: string): 'image' | 'pdf' | 'other' => {
  if (!url) return 'other';

  // Strip query params and fragments before checking extension
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(cleanUrl)) {
    return 'image';
  }
  if (cleanUrl.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'other';
};

/**
 * Checks if a URL points to an image file.
 */
export const isImageUrl = (url: string): boolean => {
  return detectFileType(url) === 'image';
};

/**
 * Checks if a URL points to a PDF file.
 */
export const isPdfUrl = (url: string): boolean => {
  return detectFileType(url) === 'pdf';
};

/**
 * Generates a thumbnail-friendly URL for Supabase storage.
 * Adds a cache-busting param to ensure fresh loads.
 */
export const getDocumentUrl = (url: string): string => {
  if (!url) return '';
  // If URL already has query params, just append cache buster
  if (url.includes('?')) {
    return `${url}&_cb=${Date.now()}`;
  }
  return `${url}?_cb=${Date.now()}`;
};