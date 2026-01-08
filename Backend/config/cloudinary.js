const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Supports CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
    // Cloudinary automatically parses CLOUDINARY_URL from environment
    cloudinary.config();
} else {
    // Fallback to separate credentials
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

module.exports = cloudinary;
