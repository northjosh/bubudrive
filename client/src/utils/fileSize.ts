/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted size string with appropriate unit (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Alternative implementation with more precise formatting
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSizePrecise(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  // Show more decimals for smaller sizes, fewer for larger sizes
  let decimals = 2;
  if (size >= 100) decimals = 0;
  else if (size >= 10) decimals = 1;

  return size.toFixed(decimals) + " " + sizes[i];
}
