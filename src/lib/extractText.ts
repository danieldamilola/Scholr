/**
 * Text extraction is handled server-side via /api/extract-text
 * to avoid Node.js library incompatibilities in the browser.
 *
 * This file is kept only for any future client-side use;
 * FileUploadForm calls the API route directly after uploading.
 */
export async function extractTextFromFile(_file: File): Promise<string | null> {
  // No-op: extraction is now server-side via /api/extract-text
  return null
}
