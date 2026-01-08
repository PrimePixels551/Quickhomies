const express = require('express');
const router = express.Router();
const { getSetting, upsertSetting, getAllSettings } = require('../controllers/settingsController');

// Get all settings
router.get('/', getAllSettings);

// Get a specific setting by key
router.get('/:key', getSetting);

// Create or update a setting
router.post('/', upsertSetting);

module.exports = router;
