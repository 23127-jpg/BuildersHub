const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Cloudinary folder path (e.g. 'buildershub/avatars')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

module.exports = { uploadBuffer }
