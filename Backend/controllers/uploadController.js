const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
    try {
        const { image } = req.body; // Base64 image string

        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: 'quickhomies/id_proofs',
            resource_type: 'image',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
};

// Upload QR code to Cloudinary (dedicated folder)
const uploadQrCode = async (req, res) => {
    try {
        const { image } = req.body; // Base64 image string

        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        // Upload to Cloudinary in qr_codes folder
        const result = await cloudinary.uploader.upload(image, {
            folder: 'quickhomies/qr_codes',
            resource_type: 'image',
            public_id: 'partner_qr', // Always overwrite the same QR code
            overwrite: true,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto:best' }
            ]
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error('QR Upload Error:', error);
        res.status(500).json({ message: 'Failed to upload QR code', error: error.message });
    }
};

module.exports = { uploadImage, uploadQrCode };
