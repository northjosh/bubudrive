import multer from 'multer';
import path from 'path';
import { v4 } from 'uuid';
import fs from 'fs';
import { getConfig, validateEnv } from '../config/env';

validateEnv();

export const getRootDir = () => getConfig().ROOT_DIR;

const ensureUploadsDir = () => {
  const rootDir = getRootDir();
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  return rootDir;
};

// Allowed file types (whitelist approach)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.zip',
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove any path separators and dangerous characters
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure filename is not too long
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const ext = path.extname(sanitized);
    const base = sanitized.substring(0, maxLength - ext.length);
    return base + ext;
  }

  return sanitized;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadsDir());
  },
  filename: (req, file, cb) => {
    // Generate unique filename to prevent conflicts and improve security
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginalName);
    const uniqueName = `${v4()}${ext}`;

    // Store original name in file object for database
    file.originalname = sanitizedOriginalName;
    cb(null, uniqueName);
  },
});

// File filter for security
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed`));
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File extension ${ext} is not allowed`));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files per upload
  },
});
// Helper function to get safe file path
export function getSafeFilePath(filename: string): string {
  // Prevent path traversal attacks
  const safeName = path.basename(filename);
  return path.join(getRootDir(), safeName);
}
