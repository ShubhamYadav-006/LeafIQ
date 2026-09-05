import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { ApiError } from '../utils/apiError.js';

dotenv.config();

const uploadDirName = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.isAbsolute(uploadDirName)
  ? uploadDirName
  : path.join(process.cwd(), uploadDirName);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${uuidv4()}${ext || '.jpg'}`;
    cb(null, safeFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Unsupported file format '${file.mimetype}'. Only JPG, PNG, and WEBP images are allowed.`,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

export const uploadSingleLeafImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
}).single('image');

export const handleUploadMiddleware = (req, res, next) => {
  uploadSingleLeafImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          ApiError.badRequest('File size exceeds the 10MB maximum limit.', 'FILE_TOO_LARGE')
        );
      }
      return next(ApiError.badRequest(`Upload error: ${err.message}`, 'UPLOAD_ERROR'));
    } else if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(ApiError.badRequest('No image file provided in request.', 'MISSING_FILE'));
    }

    next();
  });
};

