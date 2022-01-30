const cloudinary = require('cloudinary').v2

const config = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
}

cloudinary.config(config)

export default cloudinary
