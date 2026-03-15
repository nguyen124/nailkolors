const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const IS_PROD = process.env.NODE_ENV === 'production';
const BUCKET_NAME = 'nailkolors-uploads';
const GCS_BASE = `https://storage.googleapis.com/${BUCKET_NAME}`;

let storage;
if (IS_PROD) {
  // Cloud Run: use Application Default Credentials
  const gcs = new Storage();
  const bucket = gcs.bucket(BUCKET_NAME);

  storage = multer.memoryStorage();

  // Middleware factory: uploads to GCS and sets req.fileUrl
  const uploadToGCS = (folder) => [
    multer({ storage }).single('image'),
    async (req, res, next) => {
      if (!req.file) return next();
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${folder}/${Date.now()}${ext}`;
      const blob = bucket.file(filename);
      await blob.save(req.file.buffer, { contentType: req.file.mimetype, resumable: false });
      req.fileUrl = `${GCS_BASE}/${filename}`;
      next();
    }
  ];

  module.exports = { uploadToGCS, isGCS: true };
} else {
  // Local: save to disk
  const diskStorage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
      const fs = require('fs');
      const dir = path.join(__dirname, '..', 'uploads', folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  });

  const uploadToGCS = (folder) => [
    multer({ storage: diskStorage(folder) }).single('image'),
    (req, res, next) => {
      if (req.file) req.fileUrl = `/uploads/${folder}/${req.file.filename}`;
      next();
    }
  ];

  module.exports = { uploadToGCS, isGCS: false };
}
