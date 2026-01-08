const express = require('express');
const router = express.Router();
const { uploadImage, uploadQrCode } = require('../controllers/uploadController');

router.post('/image', uploadImage);
router.post('/qr', uploadQrCode);

module.exports = router;

