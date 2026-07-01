const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campuskart/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 900, crop: 'limit', quality: 'auto' }],
  },
});

// Max 6 images per listing, matches the frontend's CreateListing.js cap.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

// Separate storage/upload for chat images — different folder so they stay
// cleanly separable from listing images, same size/type limits otherwise.
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campuskart/chats',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 900, crop: 'limit', quality: 'auto' }],
  },
});

const uploadChatImage = multer({
  storage: chatStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

module.exports = { cloudinary, upload, uploadChatImage };
