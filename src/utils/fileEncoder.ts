/**
 * Converts a File to a Hex String via Uint8Array
 */
export const fileToHexString = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Converts a Hex String back to a Blob (for preview/download)
 */
export const hexStringToBlob = (hex: string, mimeType: string): Blob => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return new Blob([bytes], { type: mimeType });
};

/**
 * 🆕 Detects MIME type from Hex "Magic Numbers"
 * This fixes the issue where mimeType wasn't saved to Firestore.
 */
export const detectMimeTypeFromHex = (hex: string): string => {
  const start = hex.substring(0, 8).toLowerCase();
  if (start.startsWith("89504e47")) return "image/png";       // PNG
  if (start.startsWith("ffd8ff")) return "image/jpeg";        // JPEG
  if (start.startsWith("25504446")) return "application/pdf"; // PDF (%PDF)
  if (start.startsWith("47494638")) return "image/gif";       // GIF (GIF8)
  return "application/octet-stream";
};

/**
 * Validates file size and type (Max 250KB to stay well under Firestore 1MB limit)
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE_BYTES = 250 * 1024; // 250 KB
  
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "File is too large. Maximum size is 250KB." };
  }
  
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, WebP, and PDF files are allowed." };
  }

  return { valid: true };
};