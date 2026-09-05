import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Returns a writable path for uploaded files.
 * On Vercel / AWS Lambda (/var/task is read-only), writes to os.tmpdir() (/tmp).
 * On local environments, writes to ./uploads or custom process.env.UPLOAD_DIR.
 */
export const getUploadDirectory = () => {
  if (process.env.UPLOAD_DIR) {
    const customPath = path.isAbsolute(process.env.UPLOAD_DIR)
      ? process.env.UPLOAD_DIR
      : path.join(process.cwd(), process.env.UPLOAD_DIR);
    ensureDirExists(customPath);
    return customPath;
  }

  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.env.NODE_ENV === 'production';

  const chosenPath = isServerless
    ? path.join(os.tmpdir(), 'leafiq_uploads')
    : path.join(process.cwd(), 'uploads');

  ensureDirExists(chosenPath);
  return chosenPath;
};

const ensureDirExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.warn(`[Storage] Warning: Failed to create upload directory at ${dirPath}:`, err.message);
  }
};
