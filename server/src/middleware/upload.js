const multer = require('multer')

const ALLOWED_MIME = ['image/jpeg', 'image/png']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file: must be JPEG or PNG under 5 MB'))
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
})

module.exports = upload
