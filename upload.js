/* ═══════════════════════════════════════════════
   Multer File Upload Middleware
   ═══════════════════════════════════════════════ */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
const booksDir = path.join(__dirname, '..', 'uploads', 'books');
fs.mkdirSync(coversDir, { recursive: true });
fs.mkdirSync(booksDir, { recursive: true });

// Cover image storage
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coversDir),
  filename: (req, file, cb) => {
    const uniqueName = `cover_${Date.now()}_${Math.round(Math.random() * 1E6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// PDF storage
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, booksDir),
  filename: (req, file, cb) => {
    const uniqueName = `book_${Date.now()}_${Math.round(Math.random() * 1E6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'), false);
  }
};

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Combined upload for book creation (cover + pdf)
const bookUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'cover') cb(null, coversDir);
      else if (file.fieldname === 'pdf') cb(null, booksDir);
      else cb(new Error('Unknown field'), null);
    },
    filename: (req, file, cb) => {
      const prefix = file.fieldname === 'cover' ? 'cover' : 'book';
      const uniqueName = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1E6)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'pdf') {
      pdfFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

module.exports = { bookUpload, coversDir, booksDir };
