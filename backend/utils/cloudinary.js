
const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dynamic Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdf = ext === '.pdf';

    return {
      folder: 'landshare_docs',
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: ['jpg', 'png', 'pdf'],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

/**
 * Unlock a raw file for public access
 * @param {string} publicId - e.g. 'landshare_docs/1690807265384-aadhar.pdf'
 */
const makeFilePublic = async (publicId) => {
  try {
    await cloudinary.api.update(publicId, {
      resource_type: 'raw',
      access_mode: 'public',
    });
    console.log(`✅ Made public: ${publicId}`);
  } catch (err) {
    console.error(`❌ Failed to make public: ${publicId}`, err);
  }
};

module.exports = { cloudinary, upload, makeFilePublic };

